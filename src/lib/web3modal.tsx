/**
 * Web3Modal (Reown AppKit) Configuration
 * 
 * Provides a modern wallet connection UI with support for multiple wallets
 * including MetaMask, Coinbase, WalletConnect-compatible wallets, and more.
 */

import React from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiProvider, useAccount, useChainId } from 'wagmi'
import { supportedChains, defaultChain } from './chains'

// Get project ID from environment (fallback for development)
// For production, get your own project ID at https://cloud.reown.com/
// Using a valid demo project ID for development - you should replace this in production
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a42b58f2c1f8b8e5d7a1c3f9e8d6b4a2'

// Configure Wagmi adapter for AppKit
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [...supportedChains],
})

// App metadata for wallet connection
const metadata = {
  name: 'KasClean.app',
  description: 'Clean up your Kaspa assets by revoking unnecessary token allowances and NFT approvals',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://revoke.kasplex.io',
  icons: [
    typeof window !== 'undefined' 
      ? `${window.location.origin}/favicon.ico`
      : '/favicon.ico'
  ],
}

// Log project ID for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Web3Modal Project ID:', projectId)
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    console.warn('⚠️ Using fallback project ID. Get your own at https://cloud.reown.com/')
  }
}

// Create AppKit instance
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [...supportedChains],
  defaultNetwork: defaultChain,
  metadata,
  features: {
    analytics: false, // Disable analytics for privacy
    email: false,     // Disable email wallet for simplicity
    socials: [],      // Disable social logins
    emailShowWallets: false,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#6366f1', // Match primary color
    '--w3m-color-mix-strength': 20,
    '--w3m-font-family': 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    '--w3m-border-radius-master': '8px',
  },
})

// Export wagmi config for use in components
export const config = wagmiAdapter.wagmiConfig

// Helper hook for wallet connection
export { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

/**
 * AppKit Provider Component
 * Wrap your app with this to enable Web3Modal
 */
export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}

/**
 * Helper function to get current connection status
 * Using standard wagmi hooks for compatibility
 */
export function useWalletConnection() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  
  return {
    isConnected,
    address: address as `0x${string}` | undefined,
    chainId: chainId || defaultChain.id,
  }
}
