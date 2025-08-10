import { Shield, Github } from 'lucide-react'
import { useAppKit, useWalletConnection } from '@/lib/web3modal'

export function TopHeader() {
  const { address, isConnected } = useWalletConnection()
  const { open } = useAppKit()

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-kaspa-teal" />
            <div>
              <h1 className="font-rubik font-bold text-kaspa-dark-gray">Kasplex Revoke</h1>
              <p className="text-xs text-kaspa-light-gray">Token Allowance Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isConnected ? (
              <button
                onClick={() => open({ view: 'Account' })}
                className="bg-kaspa-teal text-white font-oswald font-bold px-6 py-2 rounded-lg hover:bg-kaspa-teal/90 transition-colors"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            ) : (
              <button
                onClick={() => open()}
                className="bg-kaspa-teal text-white font-oswald font-bold px-6 py-2 rounded-lg hover:bg-kaspa-teal/90 transition-colors animate-gentle-pulse hover:animate-none"
              >
                Connect Wallet
              </button>
            )}
            
            <a
              href="https://github.com/kaspador/revoke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kaspa-light-gray hover:text-kaspa-dark-gray transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
