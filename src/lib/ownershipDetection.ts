import { readContract, readContracts } from 'wagmi/actions'
import { getPublicClient } from 'wagmi/actions'
import { parseAbiItem, getAddress, isAddress } from 'viem'
import { config } from './config'
import type { OwnedToken, OwnershipInfo } from '@/types/management'

// Standard ownership function ABIs
const OWNERSHIP_ABIS = [
  'function owner() view returns (address)',
  'function getOwner() view returns (address)', 
  'function admin() view returns (address)',
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function getRoleAdmin(bytes32 role) view returns (bytes32)',
  'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',
  'function OWNER_ROLE() view returns (bytes32)',
  'function deployer() view returns (address)',
  'function creator() view returns (address)'
]

// Common admin role hashes
const ADMIN_ROLES = {
  DEFAULT_ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000',
  OWNER_ROLE: '0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f',
  MINTER_ROLE: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
  PAUSER_ROLE: '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a'
}

export async function detectOwnedTokens(
  userAddress: string,
  chainId: number
): Promise<OwnedToken[]> {
  if (!isAddress(userAddress)) {
    throw new Error('Invalid user address')
  }

  const ownedTokens: OwnedToken[] = []

  try {
    // Method 1: Find tokens deployed by this address
    const deployedTokens = await findDeployedTokens(userAddress, chainId)
    ownedTokens.push(...deployedTokens)

    // Method 2: Find tokens where user is owner
    const ownedByOwnership = await findTokensByOwnership(userAddress, chainId)
    ownedTokens.push(...ownedByOwnership)

    // Method 3: Find tokens where user has admin roles
    const adminTokens = await findTokensByAdminRole(userAddress, chainId)
    ownedTokens.push(...adminTokens)

    // Remove duplicates and return
    return deduplicateTokens(ownedTokens)
  } catch (error) {
    console.error('Error detecting owned tokens:', error)
    throw new Error('Failed to detect owned tokens')
  }
}

async function findDeployedTokens(
  userAddress: string,
  chainId: number
): Promise<OwnedToken[]> {
  const client = getPublicClient(config, { chainId: chainId as 167012 })
  if (!client) throw new Error('No public client available')

  try {
    // Search for contract creation transactions
    // This is a simplified approach - in production you'd want to index this data
    const latestBlock = await client.getBlockNumber()
    const fromBlock = latestBlock - BigInt(100000) // Last ~100k blocks

    // Look for contract creation transactions from this address
    const deploymentTxs = await findContractCreations(userAddress, fromBlock, latestBlock, chainId)
    
    const tokens: OwnedToken[] = []
    for (const tx of deploymentTxs) {
      try {
        const tokenInfo = await getTokenInfo(tx.contractAddress, chainId)
        if (tokenInfo) {
          tokens.push({
            ...tokenInfo,
            ownershipType: 'deployer',
            manageableFunctions: [] // Will be populated later
          })
        }
      } catch (error) {
        console.warn(`Failed to get info for deployed contract ${tx.contractAddress}:`, error)
      }
    }

    return tokens
  } catch (error) {
    console.error('Error finding deployed tokens:', error)
    return []
  }
}

async function findTokensByOwnership(
  userAddress: string,
  chainId: number
): Promise<OwnedToken[]> {
  // This would typically query your database for known tokens
  // For now, we'll check a predefined list of popular token contracts
  const knownTokens = await getKnownTokenContracts(chainId)
  
  const tokens: OwnedToken[] = []
  
  // Check ownership in batches to avoid RPC limits
  const batchSize = 20
  for (let i = 0; i < knownTokens.length; i += batchSize) {
    const batch = knownTokens.slice(i, i + batchSize)
    const ownershipChecks = await checkOwnershipBatch(batch, userAddress, chainId)
    
    for (let j = 0; j < batch.length; j++) {
      const tokenAddress = batch[j]
      const ownership = ownershipChecks[j]
      
      if (ownership.confidence === 100) {
        try {
          const tokenInfo = await getTokenInfo(tokenAddress, chainId)
          if (tokenInfo) {
            tokens.push({
              ...tokenInfo,
              ownershipType: ownership.type,
              manageableFunctions: [] // Will be populated later
            })
          }
        } catch (error) {
          console.warn(`Failed to get info for owned token ${tokenAddress}:`, error)
        }
      }
    }
  }
  
  return tokens
}

async function findTokensByAdminRole(
  userAddress: string,
  chainId: number
): Promise<OwnedToken[]> {
  // Similar to ownership, but check for admin roles
  const knownTokens = await getKnownTokenContracts(chainId)
  const tokens: OwnedToken[] = []
  
  for (const tokenAddress of knownTokens) {
    try {
      const hasAdminRole = await checkAdminRoles(tokenAddress, userAddress, chainId)
      if (hasAdminRole) {
        const tokenInfo = await getTokenInfo(tokenAddress, chainId)
        if (tokenInfo) {
          tokens.push({
            ...tokenInfo,
            ownershipType: 'admin',
            manageableFunctions: [] // Will be populated later
          })
        }
      }
    } catch (error) {
      // Silently continue - many contracts don't have role-based access
      continue
    }
  }
  
  return tokens
}

async function checkOwnershipBatch(
  tokenAddresses: string[],
  userAddress: string,
  chainId: number
): Promise<OwnershipInfo[]> {
  // Create batch calls for different ownership functions
  const ownerCalls = tokenAddresses.map(addr => ({
    address: addr as `0x${string}`,
    abi: [parseAbiItem('function owner() view returns (address)')],
    functionName: 'owner' as const
  }))

  const getOwnerCalls = tokenAddresses.map(addr => ({
    address: addr as `0x${string}`,
    abi: [parseAbiItem('function getOwner() view returns (address)')],
    functionName: 'getOwner' as const
  }))

  try {
    const [ownerResults, getOwnerResults] = await Promise.all([
      readContracts(config, { contracts: ownerCalls }).catch(() => []),
      readContracts(config, { contracts: getOwnerCalls }).catch(() => [])
    ])

    return tokenAddresses.map((_, index) => {
      const ownerResult = ownerResults[index]
      const getOwnerResult = getOwnerResults[index]
      
      let isOwner = false
      let type: 'owner' | 'admin' | 'deployer' | 'multisig' = 'owner'
      
      if (ownerResult?.status === 'success' && ownerResult.result) {
        isOwner = (ownerResult.result as string).toLowerCase() === userAddress.toLowerCase()
      } else if (getOwnerResult?.status === 'success' && getOwnerResult.result) {
        isOwner = (getOwnerResult.result as string).toLowerCase() === userAddress.toLowerCase()
      }
      
      return {
        address: tokenAddresses[index],
        type,
        verificationMethod: 'owner_call',
        confidence: isOwner ? 100 : 0
      }
    })
  } catch (error) {
    console.error('Error checking ownership batch:', error)
    return tokenAddresses.map(addr => ({
      address: addr,
      type: 'owner' as const,
      verificationMethod: 'owner_call' as const,
      confidence: 0
    }))
  }
}

async function checkAdminRoles(
  tokenAddress: string,
  userAddress: string,
  chainId: number
): Promise<boolean> {
  try {
    // Check for DEFAULT_ADMIN_ROLE
    const hasDefaultAdmin = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: [parseAbiItem('function hasRole(bytes32 role, address account) view returns (bool)')],
      functionName: 'hasRole',
      args: [ADMIN_ROLES.DEFAULT_ADMIN, userAddress as `0x${string}`]
    })

    if (hasDefaultAdmin) return true

    // Check for OWNER_ROLE
    const hasOwnerRole = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: [parseAbiItem('function hasRole(bytes32 role, address account) view returns (bool)')],
      functionName: 'hasRole',
      args: [ADMIN_ROLES.OWNER_ROLE, userAddress as `0x${string}`]
    })

    return hasOwnerRole as boolean
  } catch (error) {
    // Contract doesn't support role-based access
    return false
  }
}

async function getTokenInfo(
  tokenAddress: string,
  chainId: number
): Promise<Omit<OwnedToken, 'ownershipType' | 'manageableFunctions'> | null> {
  try {
    const calls = [
      {
        address: tokenAddress as `0x${string}`,
        abi: [parseAbiItem('function name() view returns (string)')],
        functionName: 'name' as const
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: [parseAbiItem('function symbol() view returns (string)')],
        functionName: 'symbol' as const
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: [parseAbiItem('function totalSupply() view returns (uint256)')],
        functionName: 'totalSupply' as const
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: [parseAbiItem('function decimals() view returns (uint8)')],
        functionName: 'decimals' as const
      }
    ]

    const results = await readContracts(config, { contracts: calls })
    
    const [nameResult, symbolResult, totalSupplyResult, decimalsResult] = results

    if (nameResult?.status !== 'success' || symbolResult?.status !== 'success') {
      return null
    }

    return {
      address: getAddress(tokenAddress),
      name: nameResult.result as string,
      symbol: symbolResult.result as string,
      type: 'ERC20', // Assume ERC20 for now, could be enhanced
      deployedAt: new Date(), // Would get from deployment tx in production
      totalSupply: totalSupplyResult?.status === 'success' ? (totalSupplyResult.result as bigint).toString() : '0',
      decimals: decimalsResult?.status === 'success' ? decimalsResult.result as number : 18
    }
  } catch (error) {
    console.error(`Error getting token info for ${tokenAddress}:`, error)
    return null
  }
}

async function findContractCreations(
  userAddress: string,
  fromBlock: bigint,
  toBlock: bigint,
  chainId: number
): Promise<{ contractAddress: string; blockNumber: bigint }[]> {
  // This is a simplified implementation
  // In production, you'd want to use your indexer or a service like Etherscan API
  return []
}

async function getKnownTokenContracts(chainId: number): Promise<string[]> {
  // This would query your database for known token contracts
  // For now, return an empty array - will be populated from your indexer
  try {
    const response = await fetch('/api/known-tokens')
    if (response.ok) {
      const data = await response.json()
      return data.tokens || []
    }
  } catch (error) {
    console.error('Error fetching known tokens:', error)
  }
  return []
}

function deduplicateTokens(tokens: OwnedToken[]): OwnedToken[] {
  const seen = new Set<string>()
  return tokens.filter(token => {
    const key = token.address.toLowerCase()
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
