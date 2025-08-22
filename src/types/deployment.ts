export type TokenStandard = 'ERC20' | 'ERC721' | 'ERC1155'
export type FeatureCategory = 'core' | 'security' | 'governance' | 'economics' | 'utilities'
export type RiskLevel = 'safe' | 'moderate' | 'dangerous' | 'critical'
export type EVMVersion = 'shanghai' | 'cancun' | 'paris' | 'london'

export interface ContractTemplate {
  id: string
  name: string
  description: string
  baseContract: TokenStandard
  features: string[] // Feature IDs that are included by default
  compatibility: EVMVersion[]
  gasEstimate: number
  auditScore: number // 1-100
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert'
  icon: string
  tags: string[]
}

export interface ContractFeature {
  id: string
  name: string
  description: string
  category: FeatureCategory
  riskLevel: RiskLevel
  
  // Dependencies and conflicts
  dependencies: string[] // Feature IDs required
  conflicts: string[] // Feature IDs that conflict
  replaces: string[] // Feature IDs this replaces
  
  // Code generation
  imports: string[]
  inheritance: string[]
  stateVariables: string[]
  constructor: string[]
  functions: string[]
  modifiers: string[]
  events: string[]
  
  // Deployment info
  gasImpact: number // Additional gas cost
  complexity: number // 1-10
  auditRequired: boolean
  parameters: FeatureParameter[]
  
  // Metadata
  documentation: string
  examples: string[]
  warnings: string[]
  since: string // Solidity version
  deprecated?: boolean
}

export interface FeatureParameter {
  name: string
  type: 'address' | 'uint256' | 'string' | 'bool' | 'bytes32' | 'address[]'
  description: string
  required: boolean
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: string
  }
  placeholder?: string
}

export interface ContractConfiguration {
  // Basic info
  name: string
  symbol: string
  standard: TokenStandard
  
  // Template and features
  template: string
  selectedFeatures: string[]
  featureParameters: Record<string, any>
  
  // ERC20 specific
  decimals?: number
  initialSupply?: string
  maxSupply?: string
  
  // ERC721 specific
  baseURI?: string
  maxTokens?: number
  
  // ERC1155 specific
  uri?: string
  
  // Deployment settings
  evmVersion: EVMVersion
  optimizationRuns: number
  constructorArgs: any[]
  
  // Advanced
  upgradeability: 'none' | 'transparent' | 'uups' | 'beacon'
  accessControl: 'ownable' | 'roles' | 'multisig' | 'dao'
  pausable: boolean
  
  // Economics
  hasTax: boolean
  taxRate?: number
  hasReflection: boolean
  hasStaking: boolean
}

export interface GeneratedContract {
  id: string
  name: string
  configuration: ContractConfiguration
  
  // Generated code
  solidity: string
  abi: any[]
  bytecode: string
  
  // Analysis
  gasEstimate: number
  securityScore: number
  complexity: number
  warnings: SecurityWarning[]
  suggestions: OptimizationSuggestion[]
  
  // Deployment
  constructorParams: any[]
  deploymentScript: string
  verificationCode: string
  
  // Metadata
  createdAt: Date
  version: string
  compiler: string
}

export interface SecurityWarning {
  type: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  recommendation: string
  code?: string
  line?: number
  severity: number // 1-10
}

export interface OptimizationSuggestion {
  type: 'gas' | 'security' | 'readability' | 'maintainability'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'moderate' | 'complex'
  gasReduction?: number
}

export interface RemixDeployment {
  contractName: string
  sourceCode: string
  compilerVersion: string
  evmVersion: EVMVersion
  optimization: {
    enabled: boolean
    runs: number
  }
  constructorArgs: any[]
  libraries?: Record<string, string>
}

export interface DeploymentHistory {
  id: string
  configuration: ContractConfiguration
  contract: GeneratedContract
  deploymentTx?: string
  contractAddress?: string
  network: string
  status: 'pending' | 'deployed' | 'verified' | 'failed'
  timestamp: Date
  gasUsed?: number
  deploymentCost?: string
}

// Predefined contract templates
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'basic-erc20',
    name: 'Basic ERC20 Token',
    description: 'Simple ERC20 token with basic functionality',
    baseContract: 'ERC20',
    features: ['erc20-base'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 800000,
    auditScore: 95,
    complexity: 'basic',
    icon: '🪙',
    tags: ['simple', 'standard', 'beginner']
  },
  {
    id: 'mintable-erc20',
    name: 'Mintable ERC20',
    description: 'ERC20 token with minting capabilities',
    baseContract: 'ERC20',
    features: ['erc20-base', 'mintable', 'ownable'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 1200000,
    auditScore: 88,
    complexity: 'intermediate',
    icon: '⚡',
    tags: ['mintable', 'ownable', 'flexible']
  },
  {
    id: 'advanced-erc20',
    name: 'Advanced ERC20',
    description: 'Feature-rich ERC20 with all modern capabilities',
    baseContract: 'ERC20',
    features: ['erc20-base', 'mintable', 'burnable', 'pausable', 'access-control', 'permit'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 2000000,
    auditScore: 82,
    complexity: 'advanced',
    icon: '🚀',
    tags: ['advanced', 'secure', 'modern']
  },
  {
    id: 'deflationary-erc20',
    name: 'Deflationary Token',
    description: 'ERC20 with burn-on-transfer mechanism',
    baseContract: 'ERC20',
    features: ['erc20-base', 'burnable', 'deflation', 'ownable'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 1500000,
    auditScore: 75,
    complexity: 'advanced',
    icon: '🔥',
    tags: ['deflationary', 'burn', 'tokenomics']
  },
  {
    id: 'reflection-erc20',
    name: 'Reflection Token',
    description: 'ERC20 with automatic reward distribution',
    baseContract: 'ERC20',
    features: ['erc20-base', 'reflection', 'tax', 'ownable'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 2500000,
    auditScore: 68,
    complexity: 'expert',
    icon: '💎',
    tags: ['reflection', 'rewards', 'complex']
  },
  {
    id: 'basic-nft',
    name: 'Basic NFT Collection',
    description: 'Standard ERC721 NFT collection',
    baseContract: 'ERC721',
    features: ['erc721-base', 'enumerable', 'ownable'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 1800000,
    auditScore: 90,
    complexity: 'intermediate',
    icon: '🖼️',
    tags: ['nft', 'collection', 'art']
  },
  {
    id: 'advanced-nft',
    name: 'Advanced NFT',
    description: 'Feature-rich NFT with royalties and utilities',
    baseContract: 'ERC721',
    features: ['erc721-base', 'enumerable', 'royalty', 'pausable', 'access-control'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 2800000,
    auditScore: 85,
    complexity: 'advanced',
    icon: '👑',
    tags: ['nft', 'royalty', 'advanced']
  },
  {
    id: 'multi-token',
    name: 'Multi-Token Collection',
    description: 'ERC1155 for multiple token types',
    baseContract: 'ERC1155',
    features: ['erc1155-base', 'mintable', 'burnable', 'pausable', 'access-control'],
    compatibility: ['shanghai', 'cancun'],
    gasEstimate: 2200000,
    auditScore: 88,
    complexity: 'advanced',
    icon: '🎭',
    tags: ['multi-token', 'gaming', 'versatile']
  }
]

// Feature categories for organization
export const FEATURE_CATEGORIES = {
  core: {
    name: 'Core Features',
    description: 'Essential token functionality',
    icon: '⚙️'
  },
  security: {
    name: 'Security',
    description: 'Access control and safety features',
    icon: '🛡️'
  },
  governance: {
    name: 'Governance',
    description: 'Voting and decision-making features',
    icon: '🗳️'
  },
  economics: {
    name: 'Economics',
    description: 'Tokenomics and financial features',
    icon: '💰'
  },
  utilities: {
    name: 'Utilities',
    description: 'Additional utility features',
    icon: '🔧'
  }
} as const
