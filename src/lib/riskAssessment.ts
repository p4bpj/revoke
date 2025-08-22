import type { 
  RiskLevel, 
  ConfirmationType, 
  ExecutionPlan, 
  PreflightCheck,
  ManagementFunction 
} from '@/types/management'
import { RISK_CLASSIFICATIONS } from '@/types/management'

export function assessFunctionRisk(func: ManagementFunction): {
  riskLevel: RiskLevel
  confirmationType: ConfirmationType
  warningMessage: string
  preflightChecks: string[]
} {
  const classification = RISK_CLASSIFICATIONS[func.riskLevel]
  
  const preflightChecks = generatePreflightChecks(func)
  
  return {
    riskLevel: func.riskLevel,
    confirmationType: classification.confirmationType,
    warningMessage: classification.warningMessage,
    preflightChecks
  }
}

function generatePreflightChecks(func: ManagementFunction): string[] {
  const checks: string[] = []
  
  // Common checks for all functions
  checks.push('Verify contract ownership')
  checks.push('Estimate gas costs')
  checks.push('Check network connection')
  
  // Risk-specific checks
  switch (func.riskLevel) {
    case 'moderate':
      checks.push('Validate input parameters')
      checks.push('Check current contract state')
      break
      
    case 'dangerous':
      checks.push('Verify function permissions')
      checks.push('Check contract pause state')
      checks.push('Validate impact on token holders')
      break
      
    case 'critical':
      checks.push('Verify irreversible action understanding')
      checks.push('Check for existing safeguards')
      checks.push('Validate new owner address (if applicable)')
      checks.push('Confirm backup plans')
      break
  }
  
  // Function-specific checks
  if (func.name.toLowerCase().includes('mint')) {
    checks.push('Check total supply limits')
    checks.push('Verify recipient address')
  }
  
  if (func.name.toLowerCase().includes('burn')) {
    checks.push('Verify sufficient balance')
    checks.push('Check burn impact on supply')
  }
  
  if (func.name.toLowerCase().includes('pause')) {
    checks.push('Confirm emergency situation')
    checks.push('Notify token holders')
  }
  
  if (func.name.toLowerCase().includes('ownership')) {
    checks.push('Verify new owner capabilities')
    checks.push('Test new owner access')
    checks.push('Prepare handover documentation')
  }
  
  return checks
}

export async function performPreflightChecks(
  plan: ExecutionPlan,
  userAddress: string,
  chainId: number
): Promise<PreflightCheck[]> {
  const checks: PreflightCheck[] = []
  
  try {
    // Check 1: Verify ownership
    checks.push(await checkOwnership(plan.contractAddress, userAddress, chainId))
    
    // Check 2: Gas estimation
    checks.push(await checkGasEstimation(plan))
    
    // Check 3: Network status
    checks.push(await checkNetworkStatus(chainId))
    
    // Check 4: Contract state
    checks.push(await checkContractState(plan.contractAddress, chainId))
    
    // Check 5: Parameter validation
    checks.push(await validateParameters(plan))
    
    // Risk-specific checks
    if (plan.riskLevel === 'dangerous' || plan.riskLevel === 'critical') {
      checks.push(await checkHighRiskConditions(plan, chainId))
    }
    
    return checks
  } catch (error) {
    console.error('Error performing preflight checks:', error)
    return [{
      name: 'System Error',
      status: 'failed',
      message: 'Failed to complete preflight checks',
      critical: true
    }]
  }
}

async function checkOwnership(
  contractAddress: string,
  userAddress: string,
  chainId: number
): Promise<PreflightCheck> {
  try {
    // Import here to avoid circular dependencies
    const { readContract } = await import('wagmi/actions')
    const { parseAbiItem } = await import('viem')
    const { config } = await import('./config')
    
    const owner = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function owner() view returns (address)')],
      functionName: 'owner'
    })
    
    const isOwner = (owner as string).toLowerCase() === userAddress.toLowerCase()
    
    return {
      name: 'Ownership Verification',
      status: isOwner ? 'passed' : 'failed',
      message: isOwner 
        ? 'Confirmed: You are the contract owner'
        : 'Error: You are not the contract owner',
      critical: true
    }
  } catch (error) {
    return {
      name: 'Ownership Verification',
      status: 'failed',
      message: 'Could not verify contract ownership',
      critical: true
    }
  }
}

async function checkGasEstimation(plan: ExecutionPlan): Promise<PreflightCheck> {
  try {
    const gasLimit = plan.gasEstimate
    const isReasonable = gasLimit < BigInt(1000000) // 1M gas limit
    
    return {
      name: 'Gas Estimation',
      status: isReasonable ? 'passed' : 'warning',
      message: isReasonable
        ? `Estimated gas: ${gasLimit.toString()}`
        : `High gas estimate: ${gasLimit.toString()}`,
      critical: false
    }
  } catch (error) {
    return {
      name: 'Gas Estimation',
      status: 'warning',
      message: 'Could not estimate gas costs',
      critical: false
    }
  }
}

async function checkNetworkStatus(chainId: number): Promise<PreflightCheck> {
  try {
    const { getPublicClient } = await import('wagmi/actions')
    const { config } = await import('./config')
    
    const client = getPublicClient(config, { chainId: chainId as 167012 })
    if (!client) {
      return {
        name: 'Network Status',
        status: 'failed',
        message: 'No network connection',
        critical: true
      }
    }
    
    await client.getBlockNumber()
    
    return {
      name: 'Network Status',
      status: 'passed',
      message: 'Network connection is stable',
      critical: false
    }
  } catch (error) {
    return {
      name: 'Network Status',
      status: 'failed',
      message: 'Network connection issues detected',
      critical: true
    }
  }
}

async function checkContractState(
  contractAddress: string,
  chainId: number
): Promise<PreflightCheck> {
  try {
    const { readContract } = await import('wagmi/actions')
    const { parseAbiItem } = await import('viem')
    const { config } = await import('./config')
    
    // Check if contract is paused
    try {
      const isPaused = await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi: [parseAbiItem('function paused() view returns (bool)')],
        functionName: 'paused'
      })
      
      if (isPaused) {
        return {
          name: 'Contract State',
          status: 'warning',
          message: 'Contract is currently paused',
          critical: false
        }
      }
    } catch {
      // Contract doesn't have pause functionality
    }
    
    return {
      name: 'Contract State',
      status: 'passed',
      message: 'Contract state is normal',
      critical: false
    }
  } catch (error) {
    return {
      name: 'Contract State',
      status: 'warning',
      message: 'Could not verify contract state',
      critical: false
    }
  }
}

async function validateParameters(plan: ExecutionPlan): Promise<PreflightCheck> {
  try {
    // Basic parameter validation
    for (const arg of plan.args) {
      if (arg === null || arg === undefined) {
        return {
          name: 'Parameter Validation',
          status: 'failed',
          message: 'Missing required parameters',
          critical: true
        }
      }
      
      // Check for address parameters
      if (typeof arg === 'string' && arg.startsWith('0x') && arg.length === 42) {
        const { isAddress } = await import('viem')
        if (!isAddress(arg)) {
          return {
            name: 'Parameter Validation',
            status: 'failed',
            message: 'Invalid address parameter',
            critical: true
          }
        }
      }
    }
    
    return {
      name: 'Parameter Validation',
      status: 'passed',
      message: 'All parameters are valid',
      critical: false
    }
  } catch (error) {
    return {
      name: 'Parameter Validation',
      status: 'failed',
      message: 'Parameter validation failed',
      critical: true
    }
  }
}

async function checkHighRiskConditions(
  plan: ExecutionPlan,
  chainId: number
): Promise<PreflightCheck> {
  try {
    let warnings: string[] = []
    
    // Check for ownership transfer
    if (plan.functionName.toLowerCase().includes('ownership')) {
      warnings.push('This will transfer contract ownership')
    }
    
    // Check for pause function
    if (plan.functionName.toLowerCase().includes('pause')) {
      warnings.push('This will halt all token transfers')
    }
    
    // Check for mint with large amounts
    if (plan.functionName.toLowerCase().includes('mint') && plan.args.length > 1) {
      const amount = plan.args[1]
      if (typeof amount === 'bigint' && amount > BigInt(1000000)) {
        warnings.push('Large mint amount detected')
      }
    }
    
    return {
      name: 'High Risk Assessment',
      status: warnings.length > 0 ? 'warning' : 'passed',
      message: warnings.length > 0 
        ? `Warnings: ${warnings.join(', ')}`
        : 'No high-risk conditions detected',
      critical: false
    }
  } catch (error) {
    return {
      name: 'High Risk Assessment',
      status: 'warning',
      message: 'Could not complete risk assessment',
      critical: false
    }
  }
}

export function shouldBlockExecution(checks: PreflightCheck[]): boolean {
  return checks.some(check => check.status === 'failed' && check.critical)
}

export function getExecutionWarnings(checks: PreflightCheck[]): string[] {
  return checks
    .filter(check => check.status === 'warning' || (check.status === 'failed' && !check.critical))
    .map(check => check.message)
}
