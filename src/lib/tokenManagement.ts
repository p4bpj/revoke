import { writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import { config } from './config'
import { defaultChain } from './chains'
import { detectOwnedTokens } from './ownershipDetection'
import { analyzeContractFunctions, getContractStandards } from './contractAnalysis'
import { performPreflightChecks, shouldBlockExecution } from './riskAssessment'
import type { 
  OwnedToken, 
  ManagementFunction, 
  ExecutionPlan, 
  PreflightCheck,
  TransactionHistory 
} from '@/types/management'

export async function getOwnedTokensWithFunctions(
  userAddress: string,
  chainId: number = defaultChain.id
): Promise<OwnedToken[]> {
  try {
    // Get owned tokens
    const ownedTokens = await detectOwnedTokens(userAddress, chainId)
    
    // Analyze each token's functions
    const tokensWithFunctions = await Promise.all(
      ownedTokens.map(async (token) => {
        try {
          const functions = await analyzeContractFunctions(token.address, chainId)
          const standards = await getContractStandards(token.address, chainId)
          
          return {
            ...token,
            manageableFunctions: functions,
            type: determineTokenType(standards)
          }
        } catch (error) {
          console.error(`Error analyzing token ${token.address}:`, error)
          return {
            ...token,
            manageableFunctions: []
          }
        }
      })
    )
    
    return tokensWithFunctions
  } catch (error) {
    console.error('Error getting owned tokens:', error)
    throw new Error('Failed to fetch owned tokens')
  }
}

function determineTokenType(standards: string[]): 'ERC20' | 'ERC721' | 'ERC1155' {
  if (standards.includes('ERC1155')) return 'ERC1155'
  if (standards.includes('ERC721')) return 'ERC721'
  return 'ERC20' // Default to ERC20
}

export async function executeContractFunction(
  plan: ExecutionPlan,
  userAddress: string,
  chainId: number = defaultChain.id
): Promise<{
  success: boolean
  txHash?: string
  error?: string
  preflightChecks: PreflightCheck[]
}> {
  try {
    // Perform preflight checks
    const preflightChecks = await performPreflightChecks(plan, userAddress, chainId)
    
    // Check if execution should be blocked
    if (shouldBlockExecution(preflightChecks)) {
      return {
        success: false,
        error: 'Preflight checks failed - execution blocked',
        preflightChecks
      }
    }
    
    // Execute the function
    const hash = await writeContract(config, {
      address: plan.contractAddress as `0x${string}`,
      abi: [parseAbiItem(plan.functionName + '(...)')], // Simplified ABI
      functionName: plan.functionName as any,
      args: plan.args,
      chainId: chainId
    })
    
    // Wait for confirmation
    await waitForTransactionReceipt(config, { 
      hash, 
      chainId: chainId 
    })
    
    return {
      success: true,
      txHash: hash,
      preflightChecks
    }
  } catch (error) {
    console.error('Error executing contract function:', error)
    
    let errorMessage = 'Transaction failed'
    if (error instanceof Error) {
      if (error.message.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user'
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees'
      } else if (error.message.includes('execution reverted')) {
        errorMessage = 'Transaction reverted - check function parameters'
      } else {
        errorMessage = error.message
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      preflightChecks: []
    }
  }
}

export function createExecutionPlan(
  contractAddress: string,
  func: ManagementFunction,
  args: any[]
): ExecutionPlan {
  return {
    functionName: func.name,
    contractAddress,
    args,
    gasEstimate: BigInt(100000), // Default estimate, should be calculated
    riskLevel: func.riskLevel,
    preflightChecks: []
  }
}

// Common function builders
export const FunctionBuilders = {
  transfer: (to: string, amount: string) => ({
    to: to as `0x${string}`,
    amount: BigInt(amount)
  }),
  
  approve: (spender: string, amount: string) => ({
    spender: spender as `0x${string}`,
    amount: BigInt(amount)
  }),
  
  mint: (to: string, amount: string) => ({
    to: to as `0x${string}`,
    amount: BigInt(amount)
  }),
  
  burn: (amount: string) => ({
    amount: BigInt(amount)
  }),
  
  transferOwnership: (newOwner: string) => ({
    newOwner: newOwner as `0x${string}`
  }),
  
  blacklist: (account: string) => ({
    account: account as `0x${string}`
  }),
  
  setTaxRate: (rate: string) => ({
    rate: BigInt(rate)
  })
}

// Transaction history management
let transactionHistory: TransactionHistory[] = []

export function addToTransactionHistory(
  hash: string,
  functionName: string,
  contractAddress: string,
  args: any[]
): void {
  transactionHistory.push({
    hash,
    timestamp: new Date(),
    functionName,
    contractAddress,
    args,
    status: 'pending'
  })
}

export function updateTransactionStatus(
  hash: string,
  status: 'success' | 'failed',
  gasUsed?: bigint,
  error?: string
): void {
  const tx = transactionHistory.find(tx => tx.hash === hash)
  if (tx) {
    tx.status = status
    tx.gasUsed = gasUsed
    tx.error = error
  }
}

export function getTransactionHistory(): TransactionHistory[] {
  return [...transactionHistory].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  )
}

export function clearTransactionHistory(): void {
  transactionHistory = []
}

// Rate limiting for dangerous operations
const rateLimits = new Map<string, Date>()

export function checkRateLimit(
  userAddress: string, 
  functionName: string,
  riskLevel: string
): boolean {
  const key = `${userAddress}-${functionName}`
  const lastCall = rateLimits.get(key)
  
  if (!lastCall) {
    rateLimits.set(key, new Date())
    return true
  }
  
  const now = new Date()
  const timeDiff = now.getTime() - lastCall.getTime()
  
  // Rate limits based on risk level
  const limits = {
    dangerous: 60 * 60 * 1000, // 1 hour
    critical: 24 * 60 * 60 * 1000 // 24 hours
  }
  
  const limit = limits[riskLevel] || 0
  
  if (timeDiff < limit) {
    return false
  }
  
  rateLimits.set(key, now)
  return true
}

// Utility functions
export function formatTokenAmount(
  amount: string | bigint,
  decimals: number = 18
): string {
  const { formatUnits } = require('viem')
  return formatUnits(BigInt(amount), decimals)
}

export function parseTokenAmount(
  amount: string,
  decimals: number = 18
): bigint {
  const { parseUnits } = require('viem')
  return parseUnits(amount, decimals)
}

export function validateAddress(address: string): boolean {
  const { isAddress } = require('viem')
  return isAddress(address)
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
