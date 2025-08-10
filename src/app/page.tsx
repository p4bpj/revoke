'use client'


import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
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
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <WalletApp />
      </main>
    </div>
  )
}