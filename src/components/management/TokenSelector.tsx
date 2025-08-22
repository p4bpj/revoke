'use client'

import { useState } from 'react'
import { ChevronRight, Crown, UserCheck, Settings, Copy, ExternalLink } from 'lucide-react'
import type { OwnedToken } from '@/types/management'

interface TokenSelectorProps {
  tokens: OwnedToken[]
  selectedToken: OwnedToken | null
  onTokenSelect: (token: OwnedToken) => void
}

export function TokenSelector({ tokens, selectedToken, onTokenSelect }: TokenSelectorProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const handleCopyAddress = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const getOwnershipIcon = (type: string) => {
    switch (type) {
      case 'deployer':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'owner':
        return <UserCheck className="w-4 h-4 text-blue-600" />
      case 'admin':
        return <Settings className="w-4 h-4 text-purple-600" />
      default:
        return <UserCheck className="w-4 h-4 text-gray-600" />
    }
  }

  const getOwnershipColor = (type: string) => {
    switch (type) {
      case 'deployer':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'owner':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'admin':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="font-oswald font-bold text-kaspa-dark-gray">Your Tokens</h3>
        <p className="text-sm text-gray-600">{tokens.length} manageable contracts</p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {tokens.map((token) => (
          <button
            key={token.address}
            onClick={() => onTokenSelect(token)}
            className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
              selectedToken?.address === token.address ? 'bg-kaspa-teal/5 border-kaspa-teal/20' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Token Name & Symbol */}
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-kaspa-dark-gray truncate">
                    {token.name}
                  </h4>
                  <span className="text-sm text-gray-500">({token.symbol})</span>
                </div>

                {/* Address */}
                <div className="flex items-center gap-1 mb-2">
                  <code className="text-xs text-gray-500 font-mono">
                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                  </code>
                  <button
                    onClick={(e) => handleCopyAddress(token.address, e)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy address"
                  >
                    <Copy className="w-3 h-3 text-gray-400" />
                  </button>
                  {copiedAddress === token.address && (
                    <span className="text-xs text-green-600">Copied!</span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {/* Token Type */}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    token.type === 'ERC20' 
                      ? 'bg-blue-100 text-blue-800'
                      : token.type === 'ERC721'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {token.type}
                  </span>

                  {/* Ownership Type */}
                  <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                    getOwnershipColor(token.ownershipType)
                  }`}>
                    {getOwnershipIcon(token.ownershipType)}
                    {token.ownershipType.toUpperCase()}
                  </span>
                </div>

                {/* Functions Count */}
                <div className="text-xs text-gray-500">
                  {token.manageableFunctions.length} function{token.manageableFunctions.length !== 1 ? 's' : ''} available
                </div>

                {/* Function Risk Summary */}
                {token.manageableFunctions.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {['safe', 'moderate', 'dangerous', 'critical'].map(risk => {
                      const count = token.manageableFunctions.filter(f => f.riskLevel === risk).length
                      if (count === 0) return null
                      
                      return (
                        <span
                          key={risk}
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            risk === 'safe' ? 'bg-green-100 text-green-700' :
                            risk === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            risk === 'dangerous' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {count} {risk}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              <div className="flex-shrink-0">
                {selectedToken?.address === token.address ? (
                  <ChevronRight className="w-5 h-5 text-kaspa-teal" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3" />
          <p className="text-sm">No tokens found</p>
        </div>
      )}
    </div>
  )
}
