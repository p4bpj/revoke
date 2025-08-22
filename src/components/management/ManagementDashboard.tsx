'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWalletConnection } from '@/lib/web3modal'
import { getOwnedTokensWithFunctions } from '@/lib/tokenManagement'
import { OwnedTokensScanner } from './OwnedTokensScanner'
import { TokenSelector } from './TokenSelector'
import { FunctionGrid } from './FunctionGrid'
import { TransactionHistory } from './TransactionHistory'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { OwnedToken } from '@/types/management'
import { Wallet, AlertTriangle, Info } from 'lucide-react'

export function ManagementDashboard() {
  const { address, isConnected, chainId } = useWalletConnection()
  const [ownedTokens, setOwnedTokens] = useState<OwnedToken[]>([])
  const [selectedToken, setSelectedToken] = useState<OwnedToken | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleScanTokens = useCallback(async () => {
    if (!address || !chainId) return

    setIsScanning(true)
    setError(null)

    try {
      const tokens = await getOwnedTokensWithFunctions(address, chainId)
      setOwnedTokens(tokens)
      
      // Auto-select first token if available
      if (tokens.length > 0 && !selectedToken) {
        setSelectedToken(tokens[0])
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to scan for owned tokens'
      setError(errorMsg)
    } finally {
      setIsScanning(false)
    }
  }, [address, chainId, selectedToken])

  // Auto-scan when wallet connects
  useEffect(() => {
    if (isConnected && address && chainId && ownedTokens.length === 0) {
      handleScanTokens()
    }
  }, [isConnected, address, chainId, ownedTokens.length, handleScanTokens])

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-kaspa-teal mx-auto mb-4" />
          <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            Connect your wallet to discover and manage tokens you own. You can mint, burn, pause, 
            and configure your smart contracts directly from this interface.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            ↗️ Click &quot;Connect Wallet&quot; in the top right corner
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-kaspa-teal to-kaspa-bright-teal text-white rounded-xl p-6">
        <h1 className="text-3xl font-oswald font-bold mb-2">Token Management</h1>
        <p className="text-white/90 max-w-2xl">
          Manage your deployed smart contracts with confidence. Execute functions, configure settings, 
          and monitor your tokens with built-in safety checks.
        </p>
      </div>

      {/* Token Scanner */}
      <OwnedTokensScanner 
        onScan={handleScanTokens}
        isScanning={isScanning}
        tokensFound={ownedTokens.length}
        error={error}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={handleScanTokens}
            className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      {ownedTokens.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Token Selector */}
          <div className="lg:col-span-1">
            <TokenSelector
              tokens={ownedTokens}
              selectedToken={selectedToken}
              onTokenSelect={setSelectedToken}
            />
          </div>

          {/* Management Interface */}
          <div className="lg:col-span-3 space-y-6">
            {selectedToken ? (
              <>
                {/* Token Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-oswald font-bold text-kaspa-dark-gray">
                        {selectedToken.name} ({selectedToken.symbol})
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {selectedToken.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total Supply</div>
                      <div className="font-mono text-lg">
                        {parseInt(selectedToken.totalSupply).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedToken.type === 'ERC20' 
                        ? 'bg-blue-100 text-blue-800'
                        : selectedToken.type === 'ERC721'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedToken.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedToken.ownershipType === 'deployer'
                        ? 'bg-kaspa-teal/10 text-kaspa-teal'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedToken.ownershipType.toUpperCase()}
                    </span>
                    <span className="text-gray-500">
                      {selectedToken.manageableFunctions.length} functions available
                    </span>
                  </div>
                </div>

                {/* Functions Grid */}
                {selectedToken.manageableFunctions.length > 0 ? (
                  <FunctionGrid
                    token={selectedToken}
                    functions={selectedToken.manageableFunctions}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Management Functions Available
                    </h3>
                    <p className="text-gray-600">
                      This contract doesn&apos;t expose any standard management functions that can be safely executed.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Token
                </h3>
                <p className="text-gray-600">
                  Choose a token from the list to start managing its functions.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : !isScanning && !error ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Owned Tokens Found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find any tokens that you own or have admin access to. 
            This could mean:
          </p>
          <ul className="text-gray-600 text-sm space-y-1 max-w-md mx-auto mb-6">
            <li>• You haven&apos;t deployed any smart contracts</li>
            <li>• Your tokens use non-standard ownership patterns</li>
            <li>• The scanning process needs more time to complete</li>
          </ul>
          <button
            onClick={handleScanTokens}
            className="btn-primary"
          >
            Scan Again
          </button>
        </div>
      ) : null}

      {/* Transaction History */}
      <TransactionHistory />
    </div>
  )
}
