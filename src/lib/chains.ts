import { defineChain } from 'viem'

// Kasplex chain configuration - replace with actual Kasplex network details
export const kasplex = defineChain({
  id: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337'),
  name: 'Kasplex',
  network: 'kasplex',
  nativeCurrency: {
    decimals: 18,
    name: 'Kasplex',
    symbol: 'KAS',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.kasplextest.xyz'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.kasplextest.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kasplex Explorer',
      url: 'https://frontend.kasplextest.xyz',
    },
  },
  testnet: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
})

export const supportedChains = [kasplex]

export const defaultChain = kasplex