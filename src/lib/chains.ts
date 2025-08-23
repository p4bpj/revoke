import { defineChain } from 'viem'

// Kasplex Mainnet configuration
export const kasplex = defineChain({
  id: 167012,
  name: 'Kasplex Mainnet',
  network: 'kasplex-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Kaspa',
    symbol: 'KAS',
  },
  rpcUrls: {
    default: {
      http: ['wss://kasplextest.xyz/'],
      webSocket: ['wss://kasplextest.xyz/'],
    },
    public: {
      http: ['wss://kasplextest.xyz/'],
      webSocket: ['wss://kasplextest.xyz/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kasplex Explorer',
      url: 'https://explorer.testnet.kasplextest.xyz',
    },
  },
  testnet: false,
})

export const supportedChains = [kasplex] as const

export const defaultChain = kasplex