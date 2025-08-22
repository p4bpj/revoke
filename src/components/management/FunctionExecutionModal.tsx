'use client'

import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { OwnedToken, ManagementFunction } from '@/types/management'

interface FunctionExecutionModalProps {
  isOpen: boolean
  onClose: () => void
  token: OwnedToken
  func: ManagementFunction
}

export function FunctionExecutionModal({ isOpen, onClose, token, func }: FunctionExecutionModalProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [isExecuting, setIsExecuting] = useState(false)

  if (!isOpen) return null

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    
    // Simulate execution
    setTimeout(() => {
      setIsExecuting(false)
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-oswald font-bold text-kaspa-dark-gray">
            Execute: {func.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Risk Warning */}
          {(func.riskLevel === 'dangerous' || func.riskLevel === 'critical') && (
            <div className={`p-4 rounded-lg border ${
              func.riskLevel === 'critical'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold">
                  {func.riskLevel === 'critical' ? 'CRITICAL OPERATION' : 'HIGH RISK OPERATION'}
                </span>
              </div>
              <p className="text-sm">{func.description}</p>
            </div>
          )}

          {/* Token Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Target Contract</div>
            <div className="font-mono text-sm">{token.name} ({token.symbol})</div>
            <div className="font-mono text-xs text-gray-500">{token.address}</div>
          </div>

          {/* Function Inputs */}
          {func.inputs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Parameters</h4>
              {func.inputs.map((input, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {input.name} ({input.type})
                  </label>
                  <input
                    type="text"
                    placeholder={input.placeholder || `Enter ${input.name}`}
                    value={inputs[input.name] || ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
                  />
                  {input.description && (
                    <p className="text-xs text-gray-500 mt-1">{input.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Confirmation */}
          {func.requiresConfirmation && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Confirmation Required</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                This operation requires additional confirmation steps.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-6 py-2 rounded-lg font-oswald font-bold text-white transition-colors ${
              isExecuting
                ? 'bg-gray-400 cursor-not-allowed'
                : func.riskLevel === 'critical'
                ? 'bg-red-600 hover:bg-red-700'
                : func.riskLevel === 'dangerous'
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-kaspa-teal hover:bg-kaspa-teal/90'
            }`}
          >
            {isExecuting ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Executing...
              </div>
            ) : (
              'Execute Function'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
