export interface TokenApproval {
  id: string
  type: 'ERC20' | 'NFT'
  tokenName: string
  tokenAddress: string
  spender: string
  allowance?: string
  isDangerous: boolean
  lastUpdated?: Date
}

export interface WalletState {
  provider: any
  signer: any
  account: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
}

export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}