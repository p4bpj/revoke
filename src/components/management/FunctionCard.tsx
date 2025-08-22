'use client'

import { Play, AlertTriangle, Shield, Users, Pause, Crown } from 'lucide-react'
import type { ManagementFunction } from '@/types/management'
import { RISK_CLASSIFICATIONS } from '@/types/management'

interface FunctionCardProps {
  func: ManagementFunction
  onExecute: () => void
}

export function FunctionCard({ func, onExecute }: FunctionCardProps) {
  const risk = RISK_CLASSIFICATIONS[func.riskLevel]
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transfer':
        return <Shield className="w-4 h-4" />
      case 'mint_burn':
        return <Users className="w-4 h-4" />
      case 'access_control':
        return <AlertTriangle className="w-4 h-4" />
      case 'pause_unpause':
        return <Pause className="w-4 h-4" />
      case 'ownership':
        return <Crown className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getRiskBorderColor = () => {
    switch (func.riskLevel) {
      case 'safe':
        return 'border-green-200 hover:border-green-300'
      case 'moderate':
        return 'border-yellow-200 hover:border-yellow-300'
      case 'dangerous':
        return 'border-orange-200 hover:border-orange-300'
      case 'critical':
        return 'border-red-200 hover:border-red-300'
      default:
        return 'border-gray-200 hover:border-gray-300'
    }
  }

  return (
    <div className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-all cursor-pointer ${getRiskBorderColor()}`}
         onClick={onExecute}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getCategoryIcon(func.category)}
          <h4 className="font-oswald font-bold text-kaspa-dark-gray text-sm">
            {func.name}
          </h4>
        </div>
        
        {/* Risk Badge */}
        <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
          func.riskLevel === 'safe' ? 'bg-green-100 text-green-800' :
          func.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
          func.riskLevel === 'dangerous' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          <span>{risk.icon}</span>
          <span className="uppercase">{func.riskLevel}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-xs mb-3 leading-relaxed">
        {func.description}
      </p>

      {/* Parameters Preview */}
      {func.inputs.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Parameters:</div>
          <div className="text-xs space-y-1">
            {func.inputs.map((input, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700">{input.name}</span>
                <span className="text-gray-500 font-mono">{input.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning for dangerous functions */}
      {(func.riskLevel === 'dangerous' || func.riskLevel === 'critical') && (
        <div className={`p-2 rounded text-xs mb-3 ${
          func.riskLevel === 'dangerous' 
            ? 'bg-orange-50 text-orange-700 border border-orange-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {func.riskLevel === 'critical' ? (
            <>🚨 IRREVERSIBLE: This action cannot be undone</>
          ) : (
            <>⚠️ HIGH IMPACT: This affects all token holders</>
          )}
        </div>
      )}

      {/* Execute Button */}
      <button className={`w-full py-2 px-3 rounded-lg font-oswald font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
        func.riskLevel === 'safe' 
          ? 'bg-green-100 hover:bg-green-200 text-green-800'
          : func.riskLevel === 'moderate'
          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
          : func.riskLevel === 'dangerous'
          ? 'bg-orange-100 hover:bg-orange-200 text-orange-800'
          : 'bg-red-100 hover:bg-red-200 text-red-800'
      }`}>
        <Play className="w-3 h-3" />
        Execute Function
      </button>
    </div>
  )
}
