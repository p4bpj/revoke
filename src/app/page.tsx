'use client'

import { Shield } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the component that uses wagmi hooks to prevent hydration issues
const WalletApp = dynamic(() => import('@/components/WalletApp'), {
  ssr: false,
  loading: () => (
    <div className="card max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
      <p className="text-gray-600">Loading wallet connection...</p>
    </div>
  )
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Shield className="text-primary-500" />
            Kasplex Revoke
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Protect your assets by revoking unnecessary token allowances and NFT approvals on Kasplex.
            Keep your wallet secure by regularly auditing and removing unused permissions.
          </p>
        </div>

        <WalletApp />
      </main>
    </div>
  )
}