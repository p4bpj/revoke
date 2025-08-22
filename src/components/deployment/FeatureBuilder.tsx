'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Settings, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'
import type { ContractConfiguration } from '@/types/deployment'
import { CONTRACT_FEATURES, getCompatibleFeatures, validateFeatureSelection } from '@/lib/contractFeatures'
import { FEATURE_CATEGORIES } from '@/types/deployment'

interface FeatureBuilderProps {
  configuration: ContractConfiguration
  onConfigurationUpdate: (updates: Partial<ContractConfiguration>) => void
  onGenerate: () => void
  onBack: () => void
  isGenerating: boolean
}

export function FeatureBuilder({ 
  configuration, 
  onConfigurationUpdate, 
  onGenerate, 
  onBack, 
  isGenerating 
}: FeatureBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('core')
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] }>({ valid: true, errors: [], warnings: [] })

  useEffect(() => {
    const result = validateFeatureSelection(configuration.selectedFeatures)
    setValidation(result)
  }, [configuration.selectedFeatures])

  const compatibleFeatures = getCompatibleFeatures(configuration.selectedFeatures)

  const handleFeatureToggle = (featureId: string) => {
    const isSelected = configuration.selectedFeatures.includes(featureId)
    const newFeatures = isSelected
      ? configuration.selectedFeatures.filter(id => id !== featureId)
      : [...configuration.selectedFeatures, featureId]
    
    onConfigurationUpdate({ selectedFeatures: newFeatures })
  }

  const handleBasicConfigUpdate = (field: string, value: any) => {
    onConfigurationUpdate({ [field]: value })
  }

  const categoryFeatures = Object.values(CONTRACT_FEATURES).filter(
    feature => feature.category === selectedCategory &&
    (configuration.standard === 'ERC20' ? !feature.id.startsWith('erc721') && !feature.id.startsWith('erc1155') :
     configuration.standard === 'ERC721' ? !feature.id.startsWith('erc20') && !feature.id.startsWith('erc1155') :
     configuration.standard === 'ERC1155' ? !feature.id.startsWith('erc20') && !feature.id.startsWith('erc721') :
     true)
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-2">
          Configure Your Token
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Set basic parameters and choose features for your token. 
          Features are categorized by functionality and risk level.
        </p>
      </div>

      {/* Basic Configuration */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-oswald font-bold text-kaspa-dark-gray mb-4">
          Basic Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={configuration.name || ''}
              onChange={(e) => handleBasicConfigUpdate('name', e.target.value)}
              placeholder="My Awesome Token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              value={configuration.symbol || ''}
              onChange={(e) => handleBasicConfigUpdate('symbol', e.target.value.toUpperCase())}
              placeholder="MAT"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
            />
          </div>

          {configuration.standard === 'ERC20' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decimals
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={configuration.decimals || 18}
                  onChange={(e) => handleBasicConfigUpdate('decimals', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Supply
                </label>
                <input
                  type="text"
                  value={configuration.initialSupply || ''}
                  onChange={(e) => handleBasicConfigUpdate('initialSupply', e.target.value)}
                  placeholder="1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
                />
              </div>
            </>
          )}

          {configuration.standard === 'ERC721' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Supply
                </label>
                <input
                  type="number"
                  value={configuration.maxTokens || ''}
                  onChange={(e) => handleBasicConfigUpdate('maxTokens', parseInt(e.target.value))}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URI
                </label>
                <input
                  type="text"
                  value={configuration.baseURI || ''}
                  onChange={(e) => handleBasicConfigUpdate('baseURI', e.target.value)}
                  placeholder="https://api.example.com/metadata/"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspa-teal focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feature Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-oswald font-bold text-kaspa-dark-gray mb-4">
          Feature Categories
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(FEATURE_CATEGORIES).map(([categoryId, category]) => (
            <button
              key={categoryId}
              onClick={() => setSelectedCategory(categoryId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === categoryId
                  ? 'bg-kaspa-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryFeatures.map((feature) => {
            const isSelected = configuration.selectedFeatures.includes(feature.id)
            const isCompatible = compatibleFeatures.some(f => f.id === feature.id)
            const isDisabled = !isCompatible && !isSelected

            return (
              <div
                key={feature.id}
                className={`border rounded-lg p-4 transition-all ${
                  isSelected 
                    ? 'border-kaspa-teal bg-kaspa-teal/5'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50'
                    : 'border-gray-200 hover:border-kaspa-teal/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      feature.riskLevel === 'safe' ? 'bg-green-100 text-green-800' :
                      feature.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      feature.riskLevel === 'dangerous' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {feature.riskLevel}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => !isDisabled && handleFeatureToggle(feature.id)}
                    disabled={isDisabled}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-kaspa-teal border-kaspa-teal'
                        : isDisabled
                        ? 'border-gray-300 cursor-not-allowed'
                        : 'border-gray-300 hover:border-kaspa-teal'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Complexity: {feature.complexity}/10</span>
                  <span>Gas: +{(feature.gasImpact / 1000).toFixed(0)}K</span>
                </div>

                {feature.warnings.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="flex items-center gap-1 text-yellow-800">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="font-medium">Warning:</span>
                    </div>
                    <div className="text-yellow-700 mt-1">
                      {feature.warnings[0]}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Validation Messages */}
      {(!validation.valid || validation.warnings.length > 0) && (
        <div className="mb-6 space-y-3">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          ))}
          
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <Info className="w-4 h-4" />
              <span className="text-sm">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Templates
        </button>

        <div className="text-sm text-gray-500">
          Step 3 of 5 • Configure features
        </div>

        <button
          onClick={onGenerate}
          disabled={!validation.valid || !configuration.name || !configuration.symbol || isGenerating}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold transition-all ${
            validation.valid && configuration.name && configuration.symbol && !isGenerating
              ? 'bg-kaspa-teal text-white hover:bg-kaspa-teal/90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Generate Contract
            </>
          )}
        </button>
      </div>
    </div>
  )
}
