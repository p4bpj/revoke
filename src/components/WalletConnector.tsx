import { Wallet } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

interface WalletConnectorProps {
  onConnect: () => Promise<void>
  isConnecting: boolean
}

export function WalletConnector({ onConnect, isConnecting }: WalletConnectorProps) {
  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="btn-primary flex items-center gap-2 w-full justify-center"
    >
      {isConnecting ? (
        <>
          <LoadingSpinner size="sm" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </>
      )}
    </button>
  )
}