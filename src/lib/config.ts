import { createConfig, http } from 'wagmi'
import { metaMask, injected, walletConnect } from 'wagmi/connectors'
import { supportedChains, defaultChain } from './chains'

export const config = createConfig({
  chains: supportedChains,
  connectors: [
    metaMask(),
    injected(),
    // Temporarily disable WalletConnect to avoid console errors
    // To enable: Get a project ID from https://cloud.walletconnect.com
    // walletConnect({
    //   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    // }),
  ],
  transports: {
    [defaultChain.id]: http(),
  },
})

export { supportedChains as chains, defaultChain }