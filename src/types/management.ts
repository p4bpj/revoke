export interface OwnedToken {
  address: string;
  name: string;
  symbol: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155';
  deployedAt: Date;
  totalSupply: string;
  ownershipType: 'deployer' | 'owner' | 'admin' | 'multisig';
  manageableFunctions: ManagementFunction[];
  decimals?: number;
  holders?: number;
}

export interface ManagementFunction {
  name: string;
  signature: string;
  selector: string;
  inputs: FunctionInput[];
  riskLevel: RiskLevel;
  description: string;
  requiresConfirmation: boolean;
  category: FunctionCategory;
}

export interface FunctionInput {
  name: string;
  type: string;
  description?: string;
  placeholder?: string;
  validation?: string;
}

export type RiskLevel = 'safe' | 'moderate' | 'dangerous' | 'critical';

export type FunctionCategory = 
  | 'transfer'
  | 'mint_burn' 
  | 'access_control'
  | 'pause_unpause'
  | 'ownership'
  | 'fees_taxes'
  | 'upgrades';

export interface RiskClassification {
  level: RiskLevel;
  color: 'green' | 'yellow' | 'orange' | 'red';
  icon: string;
  confirmationType: ConfirmationType;
  warningMessage: string;
}

export type ConfirmationType = 
  | 'none'
  | 'simple'
  | 'typed'
  | 'multi_step';

export interface ContractCapability {
  address: string;
  standards: string[];
  functions: ManagementFunction[];
  isOwner: boolean;
  ownershipVerified: boolean;
  lastScanned: Date;
}

export interface OwnershipInfo {
  address: string;
  type: 'deployer' | 'owner' | 'admin' | 'multisig_member';
  verificationMethod: 'deployment_tx' | 'owner_call' | 'role_check' | 'multisig_check';
  confidence: number; // 0-100
}

export interface ExecutionPlan {
  functionName: string;
  contractAddress: string;
  args: any[];
  gasEstimate: bigint;
  riskLevel: RiskLevel;
  preflightChecks: PreflightCheck[];
}

export interface PreflightCheck {
  name: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  message: string;
  critical: boolean;
}

export interface TransactionHistory {
  hash: string;
  timestamp: Date;
  functionName: string;
  contractAddress: string;
  args: any[];
  status: 'pending' | 'success' | 'failed';
  gasUsed?: bigint;
  error?: string;
}

// Standard function definitions with risk classifications
export const STANDARD_FUNCTIONS: Record<string, Omit<ManagementFunction, 'signature' | 'selector'>> = {
  // Safe operations
  'transfer': {
    name: 'Transfer Tokens',
    inputs: [
      { name: 'to', type: 'address', description: 'Recipient address' },
      { name: 'amount', type: 'uint256', description: 'Amount to transfer' }
    ],
    riskLevel: 'safe',
    description: 'Transfer tokens to another address',
    requiresConfirmation: false,
    category: 'transfer'
  },
  
  'approve': {
    name: 'Approve Spending',
    inputs: [
      { name: 'spender', type: 'address', description: 'Address to approve' },
      { name: 'amount', type: 'uint256', description: 'Amount to approve' }
    ],
    riskLevel: 'safe',
    description: 'Approve another address to spend tokens',
    requiresConfirmation: false,
    category: 'transfer'
  },

  // Moderate risk operations
  'mint': {
    name: 'Mint Tokens',
    inputs: [
      { name: 'to', type: 'address', description: 'Address to mint to' },
      { name: 'amount', type: 'uint256', description: 'Amount to mint' }
    ],
    riskLevel: 'moderate',
    description: 'Create new tokens and assign to address',
    requiresConfirmation: true,
    category: 'mint_burn'
  },

  'burn': {
    name: 'Burn Tokens',
    inputs: [
      { name: 'amount', type: 'uint256', description: 'Amount to burn' }
    ],
    riskLevel: 'moderate',
    description: 'Permanently destroy tokens',
    requiresConfirmation: true,
    category: 'mint_burn'
  },

  'setTaxRate': {
    name: 'Set Tax Rate',
    inputs: [
      { name: 'rate', type: 'uint256', description: 'Tax rate (basis points)' }
    ],
    riskLevel: 'moderate',
    description: 'Change transaction tax rate',
    requiresConfirmation: true,
    category: 'fees_taxes'
  },

  // Dangerous operations
  'blacklist': {
    name: 'Blacklist Address',
    inputs: [
      { name: 'account', type: 'address', description: 'Address to blacklist' }
    ],
    riskLevel: 'dangerous',
    description: 'Prevent address from transacting',
    requiresConfirmation: true,
    category: 'access_control'
  },

  'whitelist': {
    name: 'Whitelist Address',
    inputs: [
      { name: 'account', type: 'address', description: 'Address to whitelist' }
    ],
    riskLevel: 'dangerous',
    description: 'Allow address to bypass restrictions',
    requiresConfirmation: true,
    category: 'access_control'
  },

  'pause': {
    name: 'Pause Contract',
    inputs: [],
    riskLevel: 'dangerous',
    description: 'Halt all token transfers',
    requiresConfirmation: true,
    category: 'pause_unpause'
  },

  'unpause': {
    name: 'Unpause Contract',
    inputs: [],
    riskLevel: 'dangerous',
    description: 'Resume token transfers',
    requiresConfirmation: true,
    category: 'pause_unpause'
  },

  // Critical operations
  'transferOwnership': {
    name: 'Transfer Ownership',
    inputs: [
      { name: 'newOwner', type: 'address', description: 'New owner address' }
    ],
    riskLevel: 'critical',
    description: 'Transfer contract ownership (IRREVERSIBLE)',
    requiresConfirmation: true,
    category: 'ownership'
  },

  'renounceOwnership': {
    name: 'Renounce Ownership',
    inputs: [],
    riskLevel: 'critical',
    description: 'Give up contract ownership forever',
    requiresConfirmation: true,
    category: 'ownership'
  }
};

export const RISK_CLASSIFICATIONS: Record<RiskLevel, RiskClassification> = {
  safe: {
    level: 'safe',
    color: 'green',
    icon: '✅',
    confirmationType: 'none',
    warningMessage: 'This operation is generally safe to perform.'
  },
  moderate: {
    level: 'moderate',
    color: 'yellow', 
    icon: '⚠️',
    confirmationType: 'simple',
    warningMessage: 'This operation will modify token state. Please review carefully.'
  },
  dangerous: {
    level: 'dangerous',
    color: 'orange',
    icon: '🟠',
    confirmationType: 'typed',
    warningMessage: 'This operation can significantly affect token holders and functionality.'
  },
  critical: {
    level: 'critical',
    color: 'red',
    icon: '🚨',
    confirmationType: 'multi_step',
    warningMessage: 'CRITICAL: This operation is irreversible and can permanently affect your token.'
  }
};
