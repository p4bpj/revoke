import { readContract, readContracts } from 'wagmi/actions'
import { getPublicClient } from 'wagmi/actions'
import { parseAbiItem, formatUnits, getAddress, isAddress } from 'viem'
import { ERC20_ABI, ERC721_ABI, ERC1155_ABI, MULTICALL3_ADDRESS } from './contracts'
import { config } from './config'

export interface TokenApproval {
  id: string
  type: 'ERC20' | 'ERC721' | 'ERC1155'
  tokenAddress: string
  tokenName: string
  tokenSymbol?: string
  spender: string
  allowance?: string
  rawAllowance?: bigint
  lastUpdated: Date
  isDangerous: boolean
}

const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925' // keccak256("Approval(address,address,uint256)")
const APPROVAL_FOR_ALL_TOPIC = '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31' // keccak256("ApprovalForAll(address,address,bool)")

// Dangerous spender addresses (known scams, exploits, etc.)
const DANGEROUS_SPENDERS = new Set([
  '0x0000000000000000000000000000000000000000',
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  // Add more known dangerous addresses
])

// Helper function to process indexed NFT approvals
async function processIndexedNFTApprovals(
  nftApprovals: any[],
  operatorApprovals: any[],
  userAddress: string,
  chainId: number
): Promise<TokenApproval[]> {
  const client = getPublicClient(config, { chainId: chainId as 167012 })
  if (!client) throw new Error('No public client available')

  const allApprovals: TokenApproval[] = []
  
  // Process individual NFT approvals
  for (const approval of nftApprovals) {
    try {
      // Get contract metadata
      const [name, symbol] = await Promise.all([
        readContract(config, {
          address: approval.contract_address as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'name',
        }).catch(() => 'NFT Collection'),
        readContract(config, {
          address: approval.contract_address as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'symbol',
        }).catch(() => undefined)
      ])

      allApprovals.push({
        id: `nft-${getAddress(approval.contract_address)}-${approval.token_id}-${getAddress(approval.approved)}`,
        type: 'ERC721',
        tokenAddress: getAddress(approval.contract_address),
        tokenName: name as string,
        tokenSymbol: symbol as string,
        spender: getAddress(approval.approved),
        allowance: `Token #${approval.token_id}`,
        lastUpdated: new Date(approval.updated_at),
        isDangerous: DANGEROUS_SPENDERS.has(approval.approved.toLowerCase()),
      })
    } catch (error) {
      console.warn(`Failed to process NFT approval for ${approval.contract_address}:`, error)
    }
  }

  // Process operator approvals (setApprovalForAll)
  for (const approval of operatorApprovals) {
    try {
      // Get contract metadata
      const [name, symbol] = await Promise.all([
        readContract(config, {
          address: approval.contract_address as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'name',
        }).catch(() => 'NFT Collection'),
        readContract(config, {
          address: approval.contract_address as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'symbol',
        }).catch(() => undefined)
      ])

      allApprovals.push({
        id: `nft-operator-${getAddress(approval.contract_address)}-${getAddress(approval.operator)}`,
        type: 'ERC721',
        tokenAddress: getAddress(approval.contract_address),
        tokenName: name as string,
        tokenSymbol: symbol as string,
        spender: getAddress(approval.operator),
        allowance: 'All NFTs',
        lastUpdated: new Date(approval.updated_at),
        isDangerous: DANGEROUS_SPENDERS.has(approval.operator.toLowerCase()),
      })
    } catch (error) {
      console.warn(`Failed to process operator approval for ${approval.contract_address}:`, error)
    }
  }

  return allApprovals
}

export async function fetchERC20Approvals(
  userAddress: string,
  chainId: number
): Promise<TokenApproval[]> {
  // Prefer server-side indexer API backed by Postgres
  try {
    const res = await fetch(`/api/approvals?owner=${userAddress}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    const rows: Array<{
      token_address: string
      spender: string
      amount: string
      updated_at: string
    }> = data.approvals || []

    // Enrich with token metadata (name, symbol, decimals) via batch on-chain calls
    const uniqueTokenAddresses = Array.from(new Set(rows.map(r => r.token_address.toLowerCase())))

    const client = getPublicClient(config, { chainId: chainId as 167012 })
    if (!client) throw new Error('No public client available')

    const metaCalls = uniqueTokenAddresses.flatMap((addr) => ([
      { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'name' },
      { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' },
      { address: addr as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' },
    ]))

    const metaResults = uniqueTokenAddresses.length > 0
      ? await readContracts(config, { contracts: metaCalls as any })
      : []

    const tokenMeta = new Map<string, { name?: string; symbol?: string; decimals?: number }>()
    for (let i = 0; i < uniqueTokenAddresses.length; i++) {
      try {
        const nameRes = metaResults[i * 3]
        const symRes = metaResults[i * 3 + 1]
        const decRes = metaResults[i * 3 + 2]
        
        tokenMeta.set(uniqueTokenAddresses[i], {
          name: (nameRes?.status === 'success' && typeof nameRes.result === 'string') ? nameRes.result : 'Token',
          symbol: (symRes?.status === 'success' && typeof symRes.result === 'string') ? symRes.result : undefined,
          decimals: (decRes?.status === 'success' && typeof decRes.result === 'number') ? decRes.result : 18,
        })
      } catch (error) {
        console.warn(`Failed to process metadata for token ${uniqueTokenAddresses[i]}:`, error)
        tokenMeta.set(uniqueTokenAddresses[i], {
          name: 'Token',
          symbol: undefined,
          decimals: 18,
        })
      }
    }

    const approvals: TokenApproval[] = rows.map((r) => {
      const meta = tokenMeta.get(r.token_address.toLowerCase()) || {}
      return {
        id: `erc20-${getAddress(r.token_address)}-${getAddress(r.spender)}`,
        type: 'ERC20',
        tokenAddress: getAddress(r.token_address),
        tokenName: meta.name || 'Token',
        tokenSymbol: meta.symbol,
        spender: getAddress(r.spender),
        allowance: (() => {
          try {
            const decimals = typeof meta.decimals === 'number' ? meta.decimals : 18
            return formatUnits(BigInt(r.amount), decimals)
          } catch {
            return r.amount
          }
        })(),
        lastUpdated: new Date(r.updated_at),
        isDangerous: DANGEROUS_SPENDERS.has(r.spender.toLowerCase()),
      }
    })

    return approvals
  } catch (apiError) {
    console.error('Indexer API error, falling back to on-chain scan:', apiError)
  }

  // Fallback to on-chain scan if API fails
  const client = getPublicClient(config, { chainId: chainId as 167012 })
  if (!client) throw new Error('No public client available')

  try {
    const latestBlock = await client.getBlockNumber()
    const fromBlock = latestBlock - BigInt(50000)
    const logs = await client.getLogs({
      address: undefined,
      event: parseAbiItem('event Approval(address indexed owner, address indexed spender, uint256 value)'),
      args: { owner: userAddress as `0x${string}` },
      fromBlock,
      toBlock: 'latest',
    })

    const approvalMap = new Map<string, { tokenAddress: string; spender: string }>()
    for (const log of logs) {
      const tokenAddress = log.address
      const spender = log.args.spender!
      const key = `${tokenAddress}-${spender}`
      approvalMap.set(key, { tokenAddress, spender })
    }

    const contractCalls = Array.from(approvalMap.values()).flatMap(({ tokenAddress, spender }) => [
      { address: tokenAddress, abi: ERC20_ABI, functionName: 'allowance', args: [userAddress, spender] },
      { address: tokenAddress, abi: ERC20_ABI, functionName: 'name' },
      { address: tokenAddress, abi: ERC20_ABI, functionName: 'symbol' },
      { address: tokenAddress, abi: ERC20_ABI, functionName: 'decimals' },
    ])

    const results = await readContracts(config, { contracts: contractCalls as any })

    const approvals: TokenApproval[] = []
    let resultIndex = 0
    const approvalEntries = Array.from(approvalMap.values())
    for (const { tokenAddress, spender } of approvalEntries) {
      try {
        const allowanceResult = results[resultIndex++]
        const nameResult = results[resultIndex++]
        const symbolResult = results[resultIndex++]
        const decimalsResult = results[resultIndex++]
        if (
          allowanceResult.status === 'success' &&
          nameResult.status === 'success' &&
          symbolResult.status === 'success' &&
          decimalsResult.status === 'success'
        ) {
          const allowance = allowanceResult.result as bigint
          if (allowance > BigInt(0)) {
            const decimals = decimalsResult.result as number
            approvals.push({
              id: `erc20-${tokenAddress}-${spender}`,
              type: 'ERC20',
              tokenAddress: getAddress(tokenAddress),
              tokenName: nameResult.result as string,
              tokenSymbol: symbolResult.result as string,
              spender: getAddress(spender),
              allowance: formatUnits(allowance, decimals),
              rawAllowance: allowance,
              lastUpdated: new Date(),
              isDangerous: DANGEROUS_SPENDERS.has(spender.toLowerCase()),
            })
          }
        }
      } catch (error) {
        console.warn(`Failed to process approval for ${tokenAddress}:`, error)
      }
    }
    return approvals
  } catch (error) {
    console.error('Error fetching ERC20 approvals:', error)
    throw new Error('Failed to fetch ERC20 approvals')
  }
}

export async function fetchNFTApprovals(
  userAddress: string,
  chainId: number
): Promise<TokenApproval[]> {
  // Try to fetch from indexer API first
  try {
    const [nftRes, operatorRes] = await Promise.all([
      fetch(`/api/nft-approvals?owner=${userAddress}`, { cache: 'no-store' }),
      fetch(`/api/operator-approvals?owner=${userAddress}`, { cache: 'no-store' })
    ])
    
    if (nftRes.ok && operatorRes.ok) {
      const [nftData, operatorData] = await Promise.all([
        nftRes.json(),
        operatorRes.json()
      ])
      
      const nftApprovals = nftData.approvals || []
      const operatorApprovals = operatorData.approvals || []
      
      // Process indexed NFT approvals and operator approvals
      const indexedApprovals = await processIndexedNFTApprovals(nftApprovals, operatorApprovals, userAddress, chainId)
      return indexedApprovals
    }
  } catch (apiError) {
    console.error('NFT Indexer API error, falling back to on-chain scan:', apiError)
  }

  // Fallback to on-chain scan if API fails
  const client = getPublicClient(config, { chainId: chainId as 167012 })
  if (!client) throw new Error('No public client available')

  try {
    const latestBlock = await client.getBlockNumber()
    const fromBlock = latestBlock - BigInt(50000)

    // Fetch ApprovalForAll events
    const logs = await client.getLogs({
      address: undefined,
      event: parseAbiItem('event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'),
      args: {
        owner: userAddress as `0x${string}`,
      },
      fromBlock,
      toBlock: 'latest',
    })

    const approvalMap = new Map<string, { tokenAddress: string; operator: string }>()
    
    for (const log of logs) {
      const tokenAddress = log.address
      const operator = log.args.operator!
      const key = `${tokenAddress}-${operator}`
      approvalMap.set(key, { tokenAddress, operator })
    }

    // Check current approval status
    const contractCalls = Array.from(approvalMap.values()).flatMap(({ tokenAddress, operator }) => [
      {
        address: tokenAddress,
        abi: ERC721_ABI,
        functionName: 'isApprovedForAll',
        args: [userAddress, operator],
      },
      {
        address: tokenAddress,
        abi: ERC721_ABI,
        functionName: 'name',
      },
      {
        address: tokenAddress,
        abi: ERC721_ABI,
        functionName: 'symbol',
      },
    ])

    const results = await readContracts(config, {
      contracts: contractCalls as any,
    })

    const approvals: TokenApproval[] = []
    let resultIndex = 0

    const nftApprovalEntries = Array.from(approvalMap.values())
    for (const { tokenAddress, operator } of nftApprovalEntries) {
      try {
        const isApprovedResult = results[resultIndex++]
        const nameResult = results[resultIndex++]
        const symbolResult = results[resultIndex++]

        if (
          isApprovedResult.status === 'success' &&
          isApprovedResult.result === true
        ) {
          const tokenName = nameResult.status === 'success' 
            ? nameResult.result as string 
            : 'Unknown NFT Collection'
          
          const tokenSymbol = symbolResult.status === 'success' 
            ? symbolResult.result as string 
            : undefined

          approvals.push({
            id: `nft-${tokenAddress}-${operator}`,
            type: 'ERC721',
            tokenAddress: getAddress(tokenAddress),
            tokenName,
            tokenSymbol,
            spender: getAddress(operator),
            lastUpdated: new Date(),
            isDangerous: DANGEROUS_SPENDERS.has(operator.toLowerCase()),
          })
        }
      } catch (error) {
        console.warn(`Failed to process NFT approval for ${tokenAddress}:`, error)
      }
    }

    return approvals
  } catch (error) {
    console.error('Error fetching NFT approvals:', error)
    throw new Error('Failed to fetch NFT approvals')
  }
}

export async function fetchAllApprovals(
  userAddress: string,
  chainId: number
): Promise<TokenApproval[]> {
  if (!isAddress(userAddress)) {
    throw new Error('Invalid user address')
  }

  const [erc20Approvals, nftApprovals] = await Promise.all([
    fetchERC20Approvals(userAddress, chainId),
    fetchNFTApprovals(userAddress, chainId),
  ])

  return [...erc20Approvals, ...nftApprovals].sort((a, b) => 
    b.lastUpdated.getTime() - a.lastUpdated.getTime()
  )
}