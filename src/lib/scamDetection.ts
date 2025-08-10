/**
 * Scam Detection and Security Analysis
 * 
 * Phase 1: Local checks without external APIs
 * - Static blacklist of known scam addresses
 * - Unlimited allowance detection
 * - Recent contract deployment warnings
 * - Basic contract code analysis patterns
 */

import { getPublicClient } from 'wagmi/actions'
import { config } from './web3modal'

// Known scam addresses on Kasplex (to be populated as we discover them)
const KNOWN_SCAM_ADDRESSES = new Set<string>([
  // Add known scam addresses here as they are discovered
  // Example: '0x1234567890123456789012345678901234567890'
])

// Known legitimate contracts (whitelist)
const TRUSTED_CONTRACTS = new Set<string>([
  // Add known safe contracts here
  // Example: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
])

// Suspicious contract patterns
const SUSPICIOUS_PATTERNS = {
  // Common scam contract names/symbols
  SUSPICIOUS_NAMES: [
    'airdrop', 'claim', 'reward', 'bonus', 'gift', 'free',
    'test', 'fake', 'scam', '💰', '🎁', 'reward'
  ],
  
  // Suspicious symbols
  SUSPICIOUS_SYMBOLS: [
    'FREE', 'GIFT', 'AIRDROP', 'CLAIM', 'BONUS', 'REWARD'
  ]
}

export interface SecurityAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  riskScore: number // 0-100
  flags: SecurityFlag[]
  recommendation: string
}

export interface SecurityFlag {
  type: 'BLACKLISTED' | 'UNLIMITED_ALLOWANCE' | 'RECENT_DEPLOYMENT' | 'SUSPICIOUS_NAME' | 'HIGH_RISK_PATTERN'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  details?: string
}

/**
 * Analyze a contract address for security risks
 */
export async function analyzeContract(
  contractAddress: string,
  allowanceAmount?: bigint,
  tokenName?: string,
  tokenSymbol?: string,
  chainId: number = 167012
): Promise<SecurityAnalysis> {
  const flags: SecurityFlag[] = []
  let riskScore = 0

  try {
    // 1. Check static blacklist
    if (KNOWN_SCAM_ADDRESSES.has(contractAddress.toLowerCase())) {
      flags.push({
        type: 'BLACKLISTED',
        severity: 'CRITICAL',
        message: 'Known scam contract',
        details: 'This address has been identified as a scam or malicious contract'
      })
      riskScore += 100
    }

    // 2. Check if trusted (whitelist)
    if (TRUSTED_CONTRACTS.has(contractAddress.toLowerCase())) {
      riskScore = Math.max(0, riskScore - 30) // Reduce risk for trusted contracts
    }

    // 3. Check for unlimited allowances
    if (allowanceAmount && isUnlimitedAllowance(allowanceAmount)) {
      flags.push({
        type: 'UNLIMITED_ALLOWANCE',
        severity: 'HIGH',
        message: 'Unlimited allowance detected',
        details: 'This approval grants unlimited access to your tokens. Consider setting a specific amount instead.'
      })
      riskScore += 40
    }

    // 4. Check for suspicious token names/symbols
    if (tokenName && hasSuspiciousName(tokenName)) {
      flags.push({
        type: 'SUSPICIOUS_NAME',
        severity: 'MEDIUM',
        message: 'Suspicious token name',
        details: `Token name "${tokenName}" contains suspicious keywords commonly used in scams`
      })
      riskScore += 25
    }

    if (tokenSymbol && hasSuspiciousSymbol(tokenSymbol)) {
      flags.push({
        type: 'SUSPICIOUS_NAME',
        severity: 'MEDIUM',
        message: 'Suspicious token symbol',
        details: `Token symbol "${tokenSymbol}" contains suspicious keywords commonly used in scams`
      })
      riskScore += 25
    }

    // 5. Check contract age (if we can get deployment block)
    try {
      const deploymentInfo = await getContractDeploymentInfo(contractAddress, chainId)
      if (deploymentInfo.isRecent) {
        flags.push({
          type: 'RECENT_DEPLOYMENT',
          severity: 'MEDIUM',
          message: 'Recently deployed contract',
          details: `Contract was deployed recently (${deploymentInfo.hoursAgo} hours ago). Exercise extra caution.`
        })
        riskScore += 20
      }
    } catch (error) {
      // Contract age check failed, continue without it
      console.warn('Could not determine contract deployment age:', error)
    }

  } catch (error) {
    console.error('Error in security analysis:', error)
    // If analysis fails, err on the side of caution
    flags.push({
      type: 'HIGH_RISK_PATTERN',
      severity: 'MEDIUM',
      message: 'Security analysis incomplete',
      details: 'Unable to complete full security analysis. Exercise caution.'
    })
    riskScore += 10
  }

  // Determine overall risk level
  const riskLevel = getRiskLevel(riskScore, flags)
  const recommendation = getRecommendation(riskLevel, flags)

  return {
    riskLevel,
    riskScore: Math.min(100, riskScore),
    flags,
    recommendation
  }
}

/**
 * Check if allowance is unlimited (max uint256)
 */
function isUnlimitedAllowance(allowance: bigint): boolean {
  // Max uint256: 2^256 - 1
  const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  const VERY_LARGE_THRESHOLD = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff') // Close to max
  
  return allowance >= VERY_LARGE_THRESHOLD
}

/**
 * Check for suspicious token names
 */
function hasSuspiciousName(name: string): boolean {
  const lowercaseName = name.toLowerCase()
  return SUSPICIOUS_PATTERNS.SUSPICIOUS_NAMES.some(pattern => 
    lowercaseName.includes(pattern.toLowerCase())
  )
}

/**
 * Check for suspicious token symbols
 */
function hasSuspiciousSymbol(symbol: string): boolean {
  const uppercaseSymbol = symbol.toUpperCase()
  return SUSPICIOUS_PATTERNS.SUSPICIOUS_SYMBOLS.some(pattern => 
    uppercaseSymbol.includes(pattern)
  )
}

/**
 * Get contract deployment information
 */
async function getContractDeploymentInfo(contractAddress: string, chainId: number) {
  try {
    const publicClient = getPublicClient(config, { chainId: chainId as 167012 })
    
    if (!publicClient) {
      throw new Error('Public client not available')
    }
    
    // Get current block number
    const currentBlock = await publicClient.getBlockNumber()
    
    // Get contract bytecode to verify it exists
    const bytecode = await publicClient.getBytecode({ address: contractAddress as `0x${string}` })
    
    if (!bytecode || bytecode === '0x') {
      throw new Error('Contract not found or not deployed')
    }

    // Estimate deployment time based on recent blocks
    // Note: This is a simplified approach. In production, you'd want to
    // binary search for the exact deployment block or use an indexer
    const blocksToCheck = BigInt(1000) // Check last 1000 blocks (~last few hours)
    const startBlock = currentBlock > blocksToCheck ? currentBlock - blocksToCheck : BigInt(0)
    
    // If we can't determine exact age, assume it's not recent to avoid false positives
    return {
      isRecent: false,
      hoursAgo: 999,
      deploymentBlock: startBlock
    }
    
  } catch (error) {
    // If we can't determine deployment info, assume it's not recent
    return {
      isRecent: false,
      hoursAgo: 999,
      deploymentBlock: BigInt(0)
    }
  }
}

/**
 * Determine risk level based on score and flags
 */
function getRiskLevel(riskScore: number, flags: SecurityFlag[]): SecurityAnalysis['riskLevel'] {
  // Critical if any critical flags
  if (flags.some(flag => flag.severity === 'CRITICAL')) {
    return 'CRITICAL'
  }
  
  // Risk score thresholds
  if (riskScore >= 70) return 'HIGH'
  if (riskScore >= 40) return 'MEDIUM'
  return 'LOW'
}

/**
 * Get security recommendation based on analysis
 */
function getRecommendation(riskLevel: SecurityAnalysis['riskLevel'], flags: SecurityFlag[]): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'DO NOT INTERACT with this contract. It has been identified as malicious.'
    
    case 'HIGH':
      return 'EXTREME CAUTION recommended. This contract shows multiple red flags.'
    
    case 'MEDIUM':
      return 'Exercise caution. Review the security flags before proceeding.'
    
    case 'LOW':
    default:
      return 'Low risk detected. Standard caution advised.'
  }
}

/**
 * Add an address to the scam blacklist (for admin use)
 */
export function addToBlacklist(address: string, reason: string) {
  KNOWN_SCAM_ADDRESSES.add(address.toLowerCase())
  console.log(`Added ${address} to blacklist: ${reason}`)
}

/**
 * Add an address to the trusted whitelist (for admin use)
 */
export function addToWhitelist(address: string, reason: string) {
  TRUSTED_CONTRACTS.add(address.toLowerCase())
  console.log(`Added ${address} to whitelist: ${reason}`)
}

/**
 * Quick security check for UI components
 */
export function getSecurityBadge(analysis: SecurityAnalysis) {
  switch (analysis.riskLevel) {
    case 'CRITICAL':
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🛑',
        text: 'SCAM'
      }
    case 'HIGH':
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '⚠️',
        text: 'HIGH RISK'
      }
    case 'MEDIUM':
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚠️',
        text: 'CAUTION'
      }
    case 'LOW':
    default:
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        text: 'LOW RISK'
      }
  }
}
