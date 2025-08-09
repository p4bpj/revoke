import { useState } from 'react'
import { AlertTriangle, RotateCcw, Shield, ExternalLink } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { defaultChain } from '@/lib/config'
import type { TokenApproval } from '@/lib/approvals'

interface AllowanceTableProps {
  approvals: TokenApproval[]
  onRevoke: (tokenAddress: string, spender: string, type: 'ERC20' | 'ERC721') => Promise<void>
  onBulkRevoke: () => Promise<void>
  isLoading: boolean
}

export function AllowanceTable({ 
  approvals, 
  onRevoke, 
  onBulkRevoke, 
  isLoading 
}: AllowanceTableProps) {
  const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set())
  const [isBulkRevoking, setIsBulkRevoking] = useState(false)

  const handleRevoke = async (approval: TokenApproval) => {
    setRevokingIds(prev => new Set([...prev, approval.id]))
    try {
      await onRevoke(approval.tokenAddress, approval.spender, approval.type as 'ERC20' | 'ERC721')
    } finally {
      setRevokingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(approval.id)
        return newSet
      })
    }
  }

  const handleBulkRevoke = async () => {
    setIsBulkRevoking(true)
    try {
      await onBulkRevoke()
    } finally {
      setIsBulkRevoking(false)
    }
  }

  // Known protocols - could be moved to a separate file
  const KNOWN_PROTOCOLS: Record<string, string> = {
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2 Router',
    '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3 Router',
    '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap V3 Router 2',
  }

  const getSpenderInfo = (spender: string) => {
    const knownProtocol = KNOWN_PROTOCOLS[spender.toLowerCase()]
    return knownProtocol || null
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const explorerBase = (defaultChain.blockExplorers?.default?.url || '').replace(/\/$/, '')
  const addressUrl = (addr: string) => `${explorerBase}/address/${addr}`

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Scanning blockchain for approvals...</p>
      </div>
    )
  }

  if (approvals.length === 0) {
    return (
      <div className="card text-center py-12">
        <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Approvals</h3>
        <p className="text-gray-600">
          Great! You don't have any active token allowances or NFT approvals.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Active Approvals</h2>
            <p className="text-gray-600">Found {approvals.length} active approvals</p>
          </div>
          <button
            onClick={handleBulkRevoke}
            disabled={isBulkRevoking || approvals.length === 0}
            className="btn-danger flex items-center gap-2"
          >
            {isBulkRevoking ? (
              <>
                <LoadingSpinner size="sm" />
                Revoking All...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Revoke All ({approvals.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Token/Collection</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Spender</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Allowance</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => {
                const isRevoking = revokingIds.has(approval.id)
                const spenderInfo = getSpenderInfo(approval.spender)
                
                return (
                  <tr
                    key={approval.id}
                    className={`table-row ${
                      approval.isDangerous 
                        ? 'bg-red-50 border-red-200' 
                        : 'border-gray-200'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {approval.isDangerous && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          approval.type === 'ERC20' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {approval.type}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {approval.tokenName}
                        </div>
                        {approval.tokenSymbol && (
                          <div className="text-xs text-gray-500">
                            {approval.tokenSymbol}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 font-mono">
                          {formatAddress(approval.tokenAddress)}
                          <button
                            onClick={() => window.open(addressUrl(approval.tokenAddress), '_blank')}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </button>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-mono text-sm text-gray-900">
                          {formatAddress(approval.spender)}
                          <button
                            onClick={() => window.open(addressUrl(approval.spender), '_blank')}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </button>
                        </div>
                        {spenderInfo && (
                          <div className="text-xs text-green-600 font-medium">
                            {spenderInfo}
                          </div>
                        )}
                        {approval.isDangerous && (
                          <div className="text-xs text-red-600 font-medium">
                            ⚠️ Potentially Dangerous
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="text-gray-900">
                        {approval.type === 'ERC20' 
                          ? (approval.allowance || '0')
                          : 'All NFTs'
                        }
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleRevoke(approval)}
                        disabled={isRevoking}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          approval.isDangerous
                            ? 'bg-red-100 hover:bg-red-200 text-red-800'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        } disabled:opacity-50`}
                      >
                        {isRevoking ? (
                          <div className="flex items-center gap-1">
                            <LoadingSpinner size="sm" />
                            Revoking...
                          </div>
                        ) : (
                          'Revoke'
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}