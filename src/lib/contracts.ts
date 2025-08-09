// Contract ABIs based on revoke.cash patterns
export const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function balanceOf(address account) view returns (uint256)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const

export const ERC721_ABI = [
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function setApprovalForAll(address operator, bool approved)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function approve(address to, uint256 tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
] as const

export const ERC1155_ABI = [
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function setApprovalForAll(address operator, bool approved)',
  'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
] as const

// Multicall3 for batch operations
export const MULTICALL3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
] as const

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' // Universal multicall3 address

// Common token lists for better UX
export const COMMON_TOKENS = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86a33E6417C8C4c23f5cfE64AA42297a00F3b',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
} as const