import { readContract } from 'wagmi/actions'
import { parseAbiItem, getAddress } from 'viem'
import { config } from './config'
import type { ManagementFunction, FunctionInput, RiskLevel } from '@/types/management'
import { STANDARD_FUNCTIONS } from '@/types/management'

// Function selectors for common management functions
const FUNCTION_SELECTORS: Record<string, string> = {
  // ERC20 Standard
  'transfer': '0xa9059cbb',
  'approve': '0x095ea7b3',
  'transferFrom': '0x23b872dd',
  
  // Ownable
  'owner': '0x8da5cb5b',
  'transferOwnership': '0xf2fde38b',
  'renounceOwnership': '0x715018a6',
  
  // Mintable
  'mint': '0x40c10f19',
  'burn': '0x42966c68',
  'burnFrom': '0x79cc6790',
  
  // Pausable
  'pause': '0x8456cb59',
  'unpause': '0x3f4ba83a',
  'paused': '0x5c975abb',
  
  // AccessControl
  'hasRole': '0x91d14854',
  'grantRole': '0x2f2ff15d',
  'revokeRole': '0xd547741f',
  'renounceRole': '0x36c78516',
  
  // Common custom functions
  'blacklist': '0xf9f92be4',
  'unblacklist': '0x1a895266',
  'isBlacklisted': '0xfe575a87',
  'setTaxRate': '0x3f3cf56c',
  'setMaxTx': '0x6b67c4df',
  'setMaxWallet': '0xf8b45b05'
}

export async function analyzeContractFunctions(
  contractAddress: string,
  chainId: number
): Promise<ManagementFunction[]> {
  const functions: ManagementFunction[] = []
  
  try {
    // Check for standard functions
    for (const [funcName, selector] of Object.entries(FUNCTION_SELECTORS)) {
      const hasFunction = await checkFunctionExists(contractAddress, selector, chainId)
      if (hasFunction) {
        const standardFunc = STANDARD_FUNCTIONS[funcName]
        if (standardFunc) {
          functions.push({
            ...standardFunc,
            signature: generateSignature(funcName, standardFunc.inputs),
            selector
          })
        } else {
          // Custom function - analyze it
          const customFunc = await analyzeCustomFunction(contractAddress, funcName, selector, chainId)
          if (customFunc) {
            functions.push(customFunc)
          }
        }
      }
    }

    // Detect additional functions through bytecode analysis (simplified)
    const additionalFunctions = await detectAdditionalFunctions(contractAddress, chainId)
    functions.push(...additionalFunctions)

    return functions
  } catch (error) {
    console.error('Error analyzing contract functions:', error)
    return []
  }
}

async function checkFunctionExists(
  contractAddress: string,
  selector: string,
  chainId: number
): Promise<boolean> {
  try {
    // Try to get contract code and check if selector exists
    const client = require('wagmi/actions').getPublicClient(config, { chainId: chainId as 167012 })
    if (!client) return false

    const code = await client.getBytecode({ address: contractAddress as `0x${string}` })
    if (!code) return false

    // Check if selector exists in bytecode (simplified check)
    const selectorBytes = selector.slice(2) // Remove 0x
    return code.includes(selectorBytes as `0x${string}`)
  } catch (error) {
    // If we can't check bytecode, try calling the function
    return await tryFunctionCall(contractAddress, selector, chainId)
  }
}

async function tryFunctionCall(
  contractAddress: string,
  selector: string,
  chainId: number
): Promise<boolean> {
  try {
    // For view functions, try calling them
    const viewFunctions = ['owner', 'paused', 'totalSupply', 'decimals', 'name', 'symbol']
    const funcName = Object.keys(FUNCTION_SELECTORS).find(key => FUNCTION_SELECTORS[key] === selector)
    
    if (funcName && viewFunctions.includes(funcName)) {
      // Try calling the function - if it doesn't revert, it exists
      await readContract(config, {
        address: contractAddress as `0x${string}`,
        abi: [parseAbiItem(`function ${funcName}() view returns (address)`)],
        functionName: funcName as any
      })
      return true
    }
    
    return false
  } catch (error) {
    // Function doesn't exist or reverted
    return false
  }
}

async function analyzeCustomFunction(
  contractAddress: string,
  functionName: string,
  selector: string,
  chainId: number
): Promise<ManagementFunction | null> {
  // Analyze custom functions and classify their risk level
  const riskLevel = classifyFunctionRisk(functionName)
  
  return {
    name: formatFunctionName(functionName),
    signature: `${functionName}()`, // Simplified - would need ABI for full signature
    selector,
    inputs: [], // Would need ABI parsing for inputs
    riskLevel,
    description: generateFunctionDescription(functionName),
    requiresConfirmation: riskLevel !== 'safe',
    category: categorizeFunctionType(functionName)
  }
}

async function detectAdditionalFunctions(
  contractAddress: string,
  chainId: number
): Promise<ManagementFunction[]> {
  // This would use more sophisticated bytecode analysis or ABI discovery
  // For now, return empty array
  return []
}

function classifyFunctionRisk(functionName: string): RiskLevel {
  const riskPatterns = {
    critical: ['transfer.*ownership', 'renounce.*ownership', 'destroy', 'selfdestruct', 'upgrade'],
    dangerous: ['pause', 'unpause', 'blacklist', 'whitelist', 'lock', 'freeze', 'emergency'],
    moderate: ['mint', 'burn', 'set.*rate', 'set.*fee', 'set.*tax', 'set.*limit'],
    safe: ['transfer', 'approve', 'allowance', 'balance', 'total.*supply']
  }

  const lowerFuncName = functionName.toLowerCase()

  for (const [level, patterns] of Object.entries(riskPatterns)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i')
      if (regex.test(lowerFuncName)) {
        return level as RiskLevel
      }
    }
  }

  // Default to moderate for unknown functions
  return 'moderate'
}

function categorizeFunctionType(functionName: string): any {
  const categoryPatterns = {
    ownership: ['owner', 'transfer.*ownership', 'renounce.*ownership'],
    mint_burn: ['mint', 'burn'],
    access_control: ['blacklist', 'whitelist', 'role', 'access'],
    pause_unpause: ['pause', 'unpause'],
    fees_taxes: ['fee', 'tax', 'rate'],
    transfer: ['transfer', 'approve', 'allowance']
  }

  const lowerFuncName = functionName.toLowerCase()

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i')
      if (regex.test(lowerFuncName)) {
        return category
      }
    }
  }

  return 'transfer' // Default category
}

function formatFunctionName(functionName: string): string {
  // Convert camelCase to Title Case
  return functionName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function generateFunctionDescription(functionName: string): string {
  const descriptions = {
    blacklist: 'Prevent an address from making transactions',
    whitelist: 'Allow an address to bypass restrictions',
    setTaxRate: 'Modify the transaction tax percentage',
    setMaxTx: 'Change the maximum transaction amount',
    setMaxWallet: 'Change the maximum wallet balance',
    lock: 'Lock tokens to prevent transfers',
    freeze: 'Freeze account to prevent transactions'
  }

  return descriptions[functionName] || `Execute ${formatFunctionName(functionName)} function`
}

function generateSignature(functionName: string, inputs: FunctionInput[]): string {
  const paramTypes = inputs.map(input => input.type).join(',')
  return `${functionName}(${paramTypes})`
}

export async function getContractStandards(
  contractAddress: string,
  chainId: number
): Promise<string[]> {
  const standards: string[] = []

  try {
    // Check ERC20
    if (await supportsERC20(contractAddress, chainId)) {
      standards.push('ERC20')
    }

    // Check ERC721
    if (await supportsERC721(contractAddress, chainId)) {
      standards.push('ERC721')
    }

    // Check ERC1155
    if (await supportsERC1155(contractAddress, chainId)) {
      standards.push('ERC1155')
    }

    // Check Ownable
    if (await supportsOwnable(contractAddress, chainId)) {
      standards.push('Ownable')
    }

    // Check Pausable
    if (await supportsPausable(contractAddress, chainId)) {
      standards.push('Pausable')
    }

    // Check AccessControl
    if (await supportsAccessControl(contractAddress, chainId)) {
      standards.push('AccessControl')
    }

    return standards
  } catch (error) {
    console.error('Error detecting contract standards:', error)
    return []
  }
}

async function supportsERC20(contractAddress: string, chainId: number): Promise<boolean> {
  try {
    const requiredFunctions = ['name', 'symbol', 'decimals', 'totalSupply', 'balanceOf', 'transfer']
    
    for (const funcName of requiredFunctions) {
      const hasFunction = await checkFunctionExists(
        contractAddress, 
        FUNCTION_SELECTORS[funcName] || '0x00000000', 
        chainId
      )
      if (!hasFunction) return false
    }
    
    return true
  } catch {
    return false
  }
}

async function supportsERC721(contractAddress: string, chainId: number): Promise<boolean> {
  try {
    // Check for ERC721 interface using supportsInterface
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function supportsInterface(bytes4 interfaceId) view returns (bool)')],
      functionName: 'supportsInterface',
      args: ['0x80ac58cd'] // ERC721 interface ID
    })
    
    return result as boolean
  } catch {
    return false
  }
}

async function supportsERC1155(contractAddress: string, chainId: number): Promise<boolean> {
  try {
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function supportsInterface(bytes4 interfaceId) view returns (bool)')],
      functionName: 'supportsInterface',
      args: ['0xd9b67a26'] // ERC1155 interface ID
    })
    
    return result as boolean
  } catch {
    return false
  }
}

async function supportsOwnable(contractAddress: string, chainId: number): Promise<boolean> {
  return await checkFunctionExists(contractAddress, FUNCTION_SELECTORS.owner, chainId)
}

async function supportsPausable(contractAddress: string, chainId: number): Promise<boolean> {
  return await checkFunctionExists(contractAddress, FUNCTION_SELECTORS.paused, chainId)
}

async function supportsAccessControl(contractAddress: string, chainId: number): Promise<boolean> {
  return await checkFunctionExists(contractAddress, FUNCTION_SELECTORS.hasRole, chainId)
}
