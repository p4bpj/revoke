'use client'

import { useState } from 'react'
import { FunctionCard } from './FunctionCard'
import { FunctionExecutionModal } from './FunctionExecutionModal'
import type { OwnedToken, ManagementFunction, RiskLevel } from '@/types/management'

interface FunctionGridProps {
  token: OwnedToken
  functions: ManagementFunction[]
}

export function FunctionGrid({ token, functions }: FunctionGridProps) {
  const [selectedFunction, setSelectedFunction] = useState<ManagementFunction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const handleFunctionClick = (func: ManagementFunction) => {
    setSelectedFunction(func)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFunction(null)
  }

  // Filter functions
  const filteredFunctions = functions.filter(func => {
    if (filterRisk !== 'all' && func.riskLevel !== filterRisk) return false
    if (filterCategory !== 'all' && func.category !== filterCategory) return false
    return true
  })

  // Group functions by category
  const functionsByCategory = filteredFunctions.reduce((acc, func) => {
    const category = func.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(func)
    return acc
  }, {} as Record<string, ManagementFunction[]>)

  // Get unique categories and risk levels for filters
  const categories = Array.from(new Set(functions.map(f => f.category)))
  const riskLevels: RiskLevel[] = ['safe', 'moderate', 'dangerous', 'critical']

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      transfer: 'Transfer & Approval',
      mint_burn: 'Mint & Burn',
      access_control: 'Access Control',
      pause_unpause: 'Pause Controls',
      ownership: 'Ownership',
      fees_taxes: 'Fees & Taxes',
      upgrades: 'Upgrades'
    }
    return titles[category] || category.replace('_', ' ').toUpperCase()
  }

  const getRiskStats = () => {
    const stats = {
      safe: functions.filter(f => f.riskLevel === 'safe').length,
      moderate: functions.filter(f => f.riskLevel === 'moderate').length,
      dangerous: functions.filter(f => f.riskLevel === 'dangerous').length,
      critical: functions.filter(f => f.riskLevel === 'critical').length
    }
    return stats
  }

  const stats = getRiskStats()

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header with filters */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-oswald font-bold text-kaspa-dark-gray">
              Management Functions
            </h3>
            <div className="text-sm text-gray-500">
              {filteredFunctions.length} of {functions.length} functions
            </div>
          </div>

          {/* Risk Level Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {riskLevels.map(risk => (
              <div
                key={risk}
                className={`p-2 rounded-lg text-center cursor-pointer transition-colors ${
                  filterRisk === risk
                    ? risk === 'safe' ? 'bg-green-100 border-green-300 text-green-800' :
                      risk === 'moderate' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' :
                      risk === 'dangerous' ? 'bg-orange-100 border-orange-300 text-orange-800' :
                      'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                } border`}
                onClick={() => setFilterRisk(filterRisk === risk ? 'all' : risk)}
              >
                <div className="text-lg font-bold">{stats[risk]}</div>
                <div className="text-xs capitalize">{risk}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Risk Filter */}
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as RiskLevel | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="safe">Safe Only</option>
              <option value="moderate">Moderate Risk</option>
              <option value="dangerous">Dangerous</option>
              <option value="critical">Critical</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryTitle(category)}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filterRisk !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setFilterRisk('all')
                  setFilterCategory('all')
                }}
                className="px-3 py-2 text-sm text-kaspa-teal hover:bg-kaspa-teal/10 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Functions by Category */}
        <div className="p-6">
          {Object.keys(functionsByCategory).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg mb-2">No functions match your filters</div>
              <button
                onClick={() => {
                  setFilterRisk('all')
                  setFilterCategory('all')
                }}
                className="text-kaspa-teal hover:underline"
              >
                Clear filters to see all functions
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(functionsByCategory).map(([category, categoryFunctions]) => (
                <div key={category}>
                  <h4 className="text-lg font-oswald font-bold text-kaspa-dark-gray mb-4 flex items-center gap-2">
                    {getCategoryTitle(category)}
                    <span className="text-sm font-normal text-gray-500">
                      ({categoryFunctions.length})
                    </span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryFunctions.map((func) => (
                      <FunctionCard
                        key={func.selector}
                        func={func}
                        onExecute={() => handleFunctionClick(func)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Function Execution Modal */}
      {selectedFunction && (
        <FunctionExecutionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          token={token}
          func={selectedFunction}
        />
      )}
    </>
  )
}
