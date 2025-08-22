'use client'

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

export function TransactionHistory() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Mock data - would come from actual transaction history
  const transactions: Array<{
    hash: string
    timestamp: Date
    functionName: string
    contractAddress: string
    status: 'pending' | 'success' | 'failed'
    args: string[]
  }> = [
    {
      hash: '0x1234...5678',
      timestamp: new Date(Date.now() - 60000),
      functionName: 'Mint Tokens',
      contractAddress: '0xabcd...efgh',
      status: 'success',
      args: ['0x9876...5432', '1000000000000000000000']
    },
    {
      hash: '0x2345...6789',
      timestamp: new Date(Date.now() - 3600000),
      functionName: 'Set Tax Rate',
      contractAddress: '0xabcd...efgh',
      status: 'failed',
      args: ['500']
    }
  ]

  if (transactions.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div>
          <h3 className="font-oswald font-bold text-kaspa-dark-gray text-left">
            Recent Transactions
          </h3>
          <p className="text-sm text-gray-600 text-left">
            {transactions.length} management transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t">
          {transactions.map((tx, index) => (
            <div key={tx.hash} className={`p-4 ${index !== transactions.length - 1 ? 'border-b' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {tx.status === 'pending' && (
                      <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
                    )}
                    {tx.status === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {tx.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {tx.functionName}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        tx.status === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Contract: {tx.contractAddress}</div>
                      <div>
                        {tx.timestamp.toLocaleTimeString()} • {tx.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Link */}
                <a
                  href={`https://explorer.kaspa.org/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="View on explorer"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
