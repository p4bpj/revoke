'use client'

import { Search, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface OwnedTokensScannerProps {
  onScan: () => void
  isScanning: boolean
  tokensFound: number
  error: string | null
}

export function OwnedTokensScanner({ 
  onScan, 
  isScanning, 
  tokensFound, 
  error 
}: OwnedTokensScannerProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            error 
              ? 'bg-red-100 text-red-600'
              : tokensFound > 0 
              ? 'bg-green-100 text-green-600'
              : 'bg-kaspa-teal/10 text-kaspa-teal'
          }`}>
            {error ? (
              <AlertCircle className="w-5 h-5" />
            ) : tokensFound > 0 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-oswald font-bold text-kaspa-dark-gray">
              Token Discovery
            </h3>
            <p className="text-sm text-gray-600">
              {isScanning 
                ? 'Scanning blockchain for your tokens...'
                : error
                ? 'Scan failed - click to retry'
                : tokensFound > 0
                ? `Found ${tokensFound} manageable token${tokensFound !== 1 ? 's' : ''}`
                : 'Click to discover tokens you own'
              }
            </p>
          </div>
        </div>

        <button
          onClick={onScan}
          disabled={isScanning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-oswald font-bold transition-colors ${
            isScanning
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-kaspa-teal text-white hover:bg-kaspa-teal/90'
          }`}
        >
          {isScanning ? (
            <>
              <LoadingSpinner size="sm" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {tokensFound > 0 ? 'Rescan' : 'Scan Tokens'}
            </>
          )}
        </button>
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <div className="mt-4 space-y-2">
          <div className="text-xs text-gray-500 mb-1">Scanning progress...</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-kaspa-teal h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>✓ Checking deployed contracts</div>
            <div>✓ Verifying ownership permissions</div>
            <div className="opacity-50">• Analyzing contract functions...</div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!isScanning && tokensFound > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <strong>Discovery Complete!</strong> Found {tokensFound} token{tokensFound !== 1 ? 's' : ''} with management capabilities.
          </div>
        </div>
      )}
    </div>
  )
}
