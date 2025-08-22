import type { ContractFeature } from '@/types/deployment'

export const CONTRACT_FEATURES: Record<string, ContractFeature> = {
  // ============================================================================
  // ERC20 FEATURES
  // ============================================================================
  
  'erc20-base': {
    id: 'erc20-base',
    name: 'ERC20 Standard',
    description: 'Core ERC20 functionality with transfer, approve, and allowance',
    category: 'core',
    riskLevel: 'safe',
    dependencies: [],
    conflicts: ['erc721-base', 'erc1155-base'],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC20/ERC20.sol'],
    inheritance: ['ERC20'],
    stateVariables: [],
    constructor: ['ERC20(_name, _symbol)'],
    functions: [
      // Standard ERC20 functions are inherited
    ],
    modifiers: [],
    events: [],
    gasImpact: 0,
    complexity: 1,
    auditRequired: false,
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Token name (e.g., "My Token")',
        required: true,
        placeholder: 'My Token'
      },
      {
        name: 'symbol',
        type: 'string',
        description: 'Token symbol (e.g., "MTK")',
        required: true,
        placeholder: 'MTK'
      },
      {
        name: 'decimals',
        type: 'uint256',
        description: 'Number of decimal places',
        required: true,
        defaultValue: 18,
        validation: { min: 0, max: 18 }
      },
      {
        name: 'initialSupply',
        type: 'uint256',
        description: 'Initial token supply',
        required: true,
        placeholder: '1000000'
      }
    ],
    documentation: 'Standard ERC20 implementation following OpenZeppelin standards',
    examples: ['Basic fungible token', 'Utility token', 'Governance token'],
    warnings: [],
    since: '0.8.0'
  },

  'mintable': {
    id: 'mintable',
    name: 'Mintable',
    description: 'Allows authorized addresses to create new tokens',
    category: 'core',
    riskLevel: 'moderate',
    dependencies: ['erc20-base'],
    conflicts: ['fixed-supply'],
    replaces: [],
    imports: [],
    inheritance: [],
    stateVariables: [],
    constructor: [],
    functions: [
      `function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
      }`
    ],
    modifiers: [],
    events: [],
    gasImpact: 50000,
    complexity: 2,
    auditRequired: false,
    parameters: [
      {
        name: 'maxSupply',
        type: 'uint256',
        description: 'Maximum mintable supply (0 = unlimited)',
        required: false,
        defaultValue: 0,
        placeholder: '10000000'
      }
    ],
    documentation: 'Allows contract owner to mint new tokens',
    examples: ['Reward tokens', 'Inflationary tokens'],
    warnings: ['Unlimited minting can devalue existing tokens'],
    since: '0.8.0'
  },

  'burnable': {
    id: 'burnable',
    name: 'Burnable',
    description: 'Allows token holders to destroy their tokens',
    category: 'core',
    riskLevel: 'safe',
    dependencies: ['erc20-base'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol'],
    inheritance: ['ERC20Burnable'],
    stateVariables: [],
    constructor: [],
    functions: [],
    modifiers: [],
    events: [],
    gasImpact: 30000,
    complexity: 1,
    auditRequired: false,
    parameters: [],
    documentation: 'Allows token holders to burn their own tokens',
    examples: ['Deflationary tokens', 'Utility consumption'],
    warnings: [],
    since: '0.8.0'
  },

  'pausable': {
    id: 'pausable',
    name: 'Pausable',
    description: 'Allows pausing all token transfers in emergency situations',
    category: 'security',
    riskLevel: 'dangerous',
    dependencies: ['erc20-base'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/security/Pausable.sol'],
    inheritance: ['Pausable'],
    stateVariables: [],
    constructor: [],
    functions: [
      `function pause() public onlyOwner {
        _pause();
      }`,
      `function unpause() public onlyOwner {
        _unpause();
      }`,
      `function _beforeTokenTransfer(address from, address to, uint256 amount) internal whenNotPaused override {
        super._beforeTokenTransfer(from, to, amount);
      }`
    ],
    modifiers: [],
    events: [],
    gasImpact: 80000,
    complexity: 3,
    auditRequired: true,
    parameters: [],
    documentation: 'Emergency pause mechanism for all transfers',
    examples: ['Emergency stops', 'Maintenance mode'],
    warnings: ['Can freeze all token transfers', 'Centralized control risk'],
    since: '0.8.0'
  },

  'ownable': {
    id: 'ownable',
    name: 'Ownable',
    description: 'Single owner access control mechanism',
    category: 'security',
    riskLevel: 'moderate',
    dependencies: [],
    conflicts: ['access-control'],
    replaces: [],
    imports: ['@openzeppelin/contracts/access/Ownable.sol'],
    inheritance: ['Ownable'],
    stateVariables: [],
    constructor: [],
    functions: [],
    modifiers: ['onlyOwner'],
    events: [],
    gasImpact: 40000,
    complexity: 2,
    auditRequired: false,
    parameters: [
      {
        name: 'owner',
        type: 'address',
        description: 'Initial owner address',
        required: false,
        placeholder: '0x...'
      }
    ],
    documentation: 'Simple ownership model with transfer capability',
    examples: ['Simple admin functions', 'Basic access control'],
    warnings: ['Single point of failure', 'Centralized control'],
    since: '0.8.0'
  },

  'access-control': {
    id: 'access-control',
    name: 'Role-Based Access',
    description: 'Flexible role-based access control system',
    category: 'security',
    riskLevel: 'moderate',
    dependencies: [],
    conflicts: ['ownable'],
    replaces: ['ownable'],
    imports: ['@openzeppelin/contracts/access/AccessControl.sol'],
    inheritance: ['AccessControl'],
    stateVariables: [
      'bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");',
      'bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");'
    ],
    constructor: [
      '_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);'
    ],
    functions: [],
    modifiers: ['onlyRole'],
    events: [],
    gasImpact: 120000,
    complexity: 4,
    auditRequired: true,
    parameters: [],
    documentation: 'Multi-role access control with granular permissions',
    examples: ['Multi-admin tokens', 'Delegated permissions'],
    warnings: ['Complex permission management', 'Role enumeration risk'],
    since: '0.8.0'
  },

  'permit': {
    id: 'permit',
    name: 'EIP-2612 Permit',
    description: 'Gasless approvals using off-chain signatures',
    category: 'utilities',
    riskLevel: 'safe',
    dependencies: ['erc20-base'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol'],
    inheritance: ['ERC20Permit'],
    stateVariables: [],
    constructor: ['ERC20Permit(_name)'],
    functions: [],
    modifiers: [],
    events: [],
    gasImpact: 150000,
    complexity: 3,
    auditRequired: false,
    parameters: [],
    documentation: 'Enables gasless token approvals via signatures',
    examples: ['DeFi integrations', 'Meta-transactions'],
    warnings: ['Signature replay risks if not handled properly'],
    since: '0.8.0'
  },

  'snapshot': {
    id: 'snapshot',
    name: 'Balance Snapshots',
    description: 'Take snapshots of token balances at specific blocks',
    category: 'governance',
    riskLevel: 'safe',
    dependencies: ['erc20-base'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol'],
    inheritance: ['ERC20Snapshot'],
    stateVariables: [],
    constructor: [],
    functions: [
      `function snapshot() public onlyOwner returns (uint256) {
        return _snapshot();
      }`
    ],
    modifiers: [],
    events: [],
    gasImpact: 200000,
    complexity: 4,
    auditRequired: false,
    parameters: [],
    documentation: 'Historical balance tracking for governance',
    examples: ['Governance voting', 'Dividend distribution'],
    warnings: ['Increased gas costs for transfers'],
    since: '0.8.0'
  },

  'votes': {
    id: 'votes',
    name: 'Governance Votes',
    description: 'Voting power delegation for governance',
    category: 'governance',
    riskLevel: 'safe',
    dependencies: ['erc20-base', 'permit'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol'],
    inheritance: ['ERC20Votes'],
    stateVariables: [],
    constructor: [],
    functions: [],
    modifiers: [],
    events: [],
    gasImpact: 300000,
    complexity: 5,
    auditRequired: true,
    parameters: [],
    documentation: 'Delegation-based voting system compatible with Governor',
    examples: ['DAO governance', 'Delegated voting'],
    warnings: ['Complex delegation logic', 'Checkpoint gas costs'],
    since: '0.8.0'
  },

  'tax': {
    id: 'tax',
    name: 'Transaction Tax',
    description: 'Applies tax on transfers with configurable rates',
    category: 'economics',
    riskLevel: 'dangerous',
    dependencies: ['erc20-base'],
    conflicts: [],
    replaces: [],
    imports: [],
    inheritance: [],
    stateVariables: [
      'uint256 public taxRate = 0; // Tax rate in basis points (100 = 1%)',
      'address public taxReceiver;',
      'mapping(address => bool) public isExemptFromTax;'
    ],
    constructor: [],
    functions: [
      `function setTaxRate(uint256 _taxRate) public onlyOwner {
        require(_taxRate <= 1000, "Tax rate too high"); // Max 10%
        taxRate = _taxRate;
      }`,
      `function setTaxReceiver(address _taxReceiver) public onlyOwner {
        taxReceiver = _taxReceiver;
      }`,
      `function setTaxExemption(address account, bool exempt) public onlyOwner {
        isExemptFromTax[account] = exempt;
      }`,
      `function _transfer(address from, address to, uint256 amount) internal override {
        if (taxRate > 0 && !isExemptFromTax[from] && !isExemptFromTax[to] && taxReceiver != address(0)) {
          uint256 taxAmount = (amount * taxRate) / 10000;
          uint256 transferAmount = amount - taxAmount;
          super._transfer(from, taxReceiver, taxAmount);
          super._transfer(from, to, transferAmount);
        } else {
          super._transfer(from, to, amount);
        }
      }`
    ],
    modifiers: [],
    events: [
      'event TaxRateUpdated(uint256 oldRate, uint256 newRate);',
      'event TaxReceiverUpdated(address oldReceiver, address newReceiver);'
    ],
    gasImpact: 180000,
    complexity: 6,
    auditRequired: true,
    parameters: [
      {
        name: 'initialTaxRate',
        type: 'uint256',
        description: 'Initial tax rate in basis points (100 = 1%)',
        required: false,
        defaultValue: 0,
        validation: { min: 0, max: 1000 }
      },
      {
        name: 'taxReceiver',
        type: 'address',
        description: 'Address to receive tax proceeds',
        required: false,
        placeholder: '0x...'
      }
    ],
    documentation: 'Configurable transaction tax system',
    examples: ['Reflection mechanisms', 'Treasury funding'],
    warnings: ['High gas costs', 'MEV opportunities', 'Regulatory concerns'],
    since: '0.8.0'
  },

  'reflection': {
    id: 'reflection',
    name: 'Reflection Rewards',
    description: 'Automatic reward distribution to all holders',
    category: 'economics',
    riskLevel: 'critical',
    dependencies: ['erc20-base'],
    conflicts: ['votes', 'snapshot'],
    replaces: [],
    imports: [],
    inheritance: [],
    stateVariables: [
      'uint256 private constant MAX = ~uint256(0);',
      'uint256 private _tTotal;',
      'uint256 private _rTotal;',
      'uint256 private _tFeeTotal;',
      'mapping(address => uint256) private _rOwned;',
      'mapping(address => uint256) private _tOwned;',
      'mapping(address => bool) private _isExcluded;',
      'address[] private _excluded;'
    ],
    constructor: [
      '_rTotal = (MAX - (MAX % _tTotal));'
    ],
    functions: [
      // Complex reflection logic - simplified for brevity
      `function tokenFromReflection(uint256 rAmount) public view returns(uint256) {
        require(rAmount <= _rTotal, "Amount must be less than total reflections");
        uint256 currentRate = _getRate();
        return rAmount / currentRate;
      }`,
      `function reflectionFromToken(uint256 tAmount, bool deductTransferFee) public view returns(uint256) {
        require(tAmount <= _tTotal, "Amount must be less than supply");
        if (!deductTransferFee) {
          (uint256 rAmount,,,,,) = _getValues(tAmount);
          return rAmount;
        } else {
          (,uint256 rTransferAmount,,,,) = _getValues(tAmount);
          return rTransferAmount;
        }
      }`
    ],
    modifiers: [],
    events: [],
    gasImpact: 500000,
    complexity: 10,
    auditRequired: true,
    parameters: [
      {
        name: 'reflectionFee',
        type: 'uint256',
        description: 'Reflection fee percentage (in basis points)',
        required: true,
        defaultValue: 200,
        validation: { min: 0, max: 1000 }
      }
    ],
    documentation: 'Advanced reflection mechanism for automatic rewards',
    examples: ['Safemoon-style tokens', 'Holder rewards'],
    warnings: ['Extremely complex', 'High gas costs', 'Difficult to audit'],
    since: '0.8.0'
  },

  'deflation': {
    id: 'deflation',
    name: 'Deflationary Burn',
    description: 'Burns tokens on each transfer to reduce supply',
    category: 'economics',
    riskLevel: 'dangerous',
    dependencies: ['erc20-base', 'burnable'],
    conflicts: [],
    replaces: [],
    imports: [],
    inheritance: [],
    stateVariables: [
      'uint256 public burnRate = 100; // 1% burn rate in basis points'
    ],
    constructor: [],
    functions: [
      `function setBurnRate(uint256 _burnRate) public onlyOwner {
        require(_burnRate <= 500, "Burn rate too high"); // Max 5%
        burnRate = _burnRate;
      }`,
      `function _transfer(address from, address to, uint256 amount) internal override {
        uint256 burnAmount = (amount * burnRate) / 10000;
        uint256 transferAmount = amount - burnAmount;
        
        if (burnAmount > 0) {
          _burn(from, burnAmount);
        }
        
        super._transfer(from, to, transferAmount);
      }`
    ],
    modifiers: [],
    events: [
      'event Deflation(uint256 amount);'
    ],
    gasImpact: 120000,
    complexity: 4,
    auditRequired: true,
    parameters: [
      {
        name: 'initialBurnRate',
        type: 'uint256',
        description: 'Initial burn rate in basis points (100 = 1%)',
        required: false,
        defaultValue: 100,
        validation: { min: 0, max: 500 }
      }
    ],
    documentation: 'Automatic token burning on transfers',
    examples: ['Deflationary tokens', 'Supply reduction mechanisms'],
    warnings: ['Reduces circulating supply', 'Affects token economics'],
    since: '0.8.0'
  },

  // ============================================================================
  // ERC721 FEATURES
  // ============================================================================

  'erc721-base': {
    id: 'erc721-base',
    name: 'ERC721 Standard',
    description: 'Non-fungible token standard implementation',
    category: 'core',
    riskLevel: 'safe',
    dependencies: [],
    conflicts: ['erc20-base', 'erc1155-base'],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC721/ERC721.sol'],
    inheritance: ['ERC721'],
    stateVariables: [],
    constructor: ['ERC721(_name, _symbol)'],
    functions: [],
    modifiers: [],
    events: [],
    gasImpact: 0,
    complexity: 2,
    auditRequired: false,
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'NFT collection name',
        required: true,
        placeholder: 'My NFT Collection'
      },
      {
        name: 'symbol',
        type: 'string',
        description: 'NFT collection symbol',
        required: true,
        placeholder: 'MNC'
      }
    ],
    documentation: 'Standard ERC721 NFT implementation',
    examples: ['Art collections', 'Gaming items', 'Digital collectibles'],
    warnings: [],
    since: '0.8.0'
  },

  'enumerable': {
    id: 'enumerable',
    name: 'Enumerable Extension',
    description: 'Adds enumeration capabilities to NFTs',
    category: 'utilities',
    riskLevel: 'safe',
    dependencies: ['erc721-base'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol'],
    inheritance: ['ERC721Enumerable'],
    stateVariables: [],
    constructor: [],
    functions: [],
    modifiers: [],
    events: [],
    gasImpact: 200000,
    complexity: 3,
    auditRequired: false,
    parameters: [],
    documentation: 'Enables token enumeration and discovery',
    examples: ['Marketplace integration', 'Collection browsing'],
    warnings: ['Increases gas costs for minting/transferring'],
    since: '0.8.0'
  },

  'royalty': {
    id: 'royalty',
    name: 'EIP-2981 Royalties',
    description: 'Standard royalty information for NFT sales',
    category: 'economics',
    riskLevel: 'safe',
    dependencies: ['erc721-base'],
    conflicts: [],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/common/ERC2981.sol'],
    inheritance: ['ERC2981'],
    stateVariables: [],
    constructor: [],
    functions: [
      `function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
      }`,
      `function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
      }`
    ],
    modifiers: [],
    events: [],
    gasImpact: 80000,
    complexity: 3,
    auditRequired: false,
    parameters: [
      {
        name: 'royaltyReceiver',
        type: 'address',
        description: 'Address to receive royalties',
        required: true,
        placeholder: '0x...'
      },
      {
        name: 'royaltyPercentage',
        type: 'uint256',
        description: 'Royalty percentage (in basis points, 500 = 5%)',
        required: true,
        defaultValue: 500,
        validation: { min: 0, max: 1000 }
      }
    ],
    documentation: 'Standard royalty implementation for NFT marketplaces',
    examples: ['Creator royalties', 'Revenue sharing'],
    warnings: ['Not enforced by all marketplaces'],
    since: '0.8.0'
  },

  // ============================================================================
  // ERC1155 FEATURES
  // ============================================================================

  'erc1155-base': {
    id: 'erc1155-base',
    name: 'ERC1155 Multi-Token',
    description: 'Multi-token standard supporting both fungible and non-fungible tokens',
    category: 'core',
    riskLevel: 'safe',
    dependencies: [],
    conflicts: ['erc20-base', 'erc721-base'],
    replaces: [],
    imports: ['@openzeppelin/contracts/token/ERC1155/ERC1155.sol'],
    inheritance: ['ERC1155'],
    stateVariables: [],
    constructor: ['ERC1155(_uri)'],
    functions: [],
    modifiers: [],
    events: [],
    gasImpact: 0,
    complexity: 4,
    auditRequired: false,
    parameters: [
      {
        name: 'uri',
        type: 'string',
        description: 'URI template for token metadata',
        required: true,
        placeholder: 'https://api.example.com/token/{id}.json'
      }
    ],
    documentation: 'Multi-token standard for gaming and complex applications',
    examples: ['Gaming assets', 'Membership tiers', 'Utility tokens'],
    warnings: ['Complex token ID management'],
    since: '0.8.0'
  }
}

// Helper functions for feature management
export function getFeaturesByCategory(category: string): ContractFeature[] {
  return Object.values(CONTRACT_FEATURES).filter(feature => feature.category === category)
}

export function getCompatibleFeatures(selectedFeatures: string[]): ContractFeature[] {
  const selected = selectedFeatures.map(id => CONTRACT_FEATURES[id]).filter(Boolean)
  
  return Object.values(CONTRACT_FEATURES).filter(feature => {
    // Check if feature conflicts with any selected features
    const hasConflicts = selected.some(selected => 
      feature.conflicts.includes(selected.id) || selected.conflicts.includes(feature.id)
    )
    
    // Check if all dependencies are satisfied
    const dependenciesSatisfied = feature.dependencies.every(dep => 
      selectedFeatures.includes(dep)
    )
    
    return !hasConflicts && (feature.dependencies.length === 0 || dependenciesSatisfied)
  })
}

export function validateFeatureSelection(selectedFeatures: string[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  const features = selectedFeatures.map(id => CONTRACT_FEATURES[id]).filter(Boolean)
  
  // Check for conflicts
  for (let i = 0; i < features.length; i++) {
    for (let j = i + 1; j < features.length; j++) {
      if (features[i].conflicts.includes(features[j].id)) {
        errors.push(`${features[i].name} conflicts with ${features[j].name}`)
      }
    }
  }
  
  // Check for missing dependencies
  for (const feature of features) {
    for (const dep of feature.dependencies) {
      if (!selectedFeatures.includes(dep)) {
        const depFeature = CONTRACT_FEATURES[dep]
        errors.push(`${feature.name} requires ${depFeature?.name || dep}`)
      }
    }
  }
  
  // Generate warnings
  const criticalFeatures = features.filter(f => f.riskLevel === 'critical')
  if (criticalFeatures.length > 0) {
    warnings.push(`Critical features require thorough auditing: ${criticalFeatures.map(f => f.name).join(', ')}`)
  }
  
  const highComplexity = features.filter(f => f.complexity >= 8)
  if (highComplexity.length > 0) {
    warnings.push(`High complexity features may increase gas costs: ${highComplexity.map(f => f.name).join(', ')}`)
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
