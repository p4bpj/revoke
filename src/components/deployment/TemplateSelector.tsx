'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Zap, Shield, TrendingUp, Crown } from 'lucide-react'
import type { TokenStandard } from '@/types/deployment'
import { CONTRACT_TEMPLATES } from '@/types/deployment'

interface TemplateSelectorProps {
  tokenType: TokenStandard
  selectedTemplate?: string
  onTemplateSelect: (templateId: string) => void
  onNext: () => void
  onBack: () => void
}

export function TemplateSelector({ 
  tokenType, 
  selectedTemplate, 
  onTemplateSelect, 
  onNext, 
  onBack 
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const templates = CONTRACT_TEMPLATES.filter(template => template.baseContract === tokenType)

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-blue-600 bg-blue-100'
      case 'advanced': return 'text-orange-600 bg-orange-100'
      case 'expert': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAuditScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-2">
          Choose Your {tokenType} Template
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Start with a pre-built template that matches your project needs. 
          You can customize features in the next step.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id
          const isHovered = hoveredTemplate === template.id

          return (
            <button
              key={template.id}
              onClick={() => onTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-300 ${
                isSelected 
                  ? 'border-kaspa-teal bg-kaspa-teal/5 scale-105' 
                  : 'border-gray-200 hover:border-kaspa-teal/50 hover:scale-102'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{template.icon}</div>
                <div className="flex flex-col items-end gap-1">
                  {isSelected && (
                    <div className="bg-kaspa-teal text-white p-1 rounded-full">
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                    {template.complexity}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-oswald font-bold text-kaspa-dark-gray mb-2">
                {template.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {template.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Gas Estimate</div>
                  <div className="font-bold text-sm">{Math.round(template.gasEstimate / 1000)}K</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Audit Score</div>
                  <div className={`font-bold text-sm ${getAuditScoreColor(template.auditScore)}`}>
                    {template.auditScore}/100
                  </div>
                </div>
              </div>

              {/* Features Count */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Included Features</span>
                  <span>{template.features.length} features</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-kaspa-teal h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (template.features.length / 8) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-kaspa-teal/10 text-kaspa-teal rounded text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Recommended Badge */}
              {template.auditScore >= 90 && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <Crown className="w-3 h-3" />
                  <span>Recommended</span>
                </div>
              )}

              {/* Security Badge */}
              {template.auditScore >= 85 && (
                <div className="absolute top-3 right-3">
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <Shield className="w-3 h-3" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Template Details */}
      {selectedTemplate && (
        <div className="bg-kaspa-teal/5 border border-kaspa-teal/20 rounded-lg p-6 mb-6">
          {(() => {
            const template = templates.find(t => t.id === selectedTemplate)
            if (!template) return null

            return (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{template.icon}</div>
                  <div>
                    <h4 className="font-oswald font-bold text-kaspa-dark-gray">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Features Included:</h5>
                    <div className="text-sm text-gray-600">
                      {template.features.length} pre-configured features ready to customize
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Security Level:</h5>
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-medium ${getAuditScoreColor(template.auditScore)}`}>
                        {template.auditScore >= 90 ? 'Excellent' :
                         template.auditScore >= 80 ? 'Good' :
                         template.auditScore >= 70 ? 'Fair' : 'Needs Review'}
                      </div>
                      <span className="text-xs text-gray-500">({template.auditScore}/100)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">Deployment Cost:</h5>
                    <div className="text-sm text-gray-600">
                      ~{Math.round(template.gasEstimate / 1000)}K gas
                      <span className="text-xs text-gray-500 ml-1">(${((template.gasEstimate * 20) / 1e9).toFixed(2)} @ 20 gwei)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded border">
                  <h5 className="font-semibold text-gray-800 mb-2">What&apos;s Next:</h5>
                  <p className="text-sm text-gray-600">
                    You&apos;ll be able to customize features, add/remove functionality, 
                    and configure parameters in the next step. This template provides 
                    a solid foundation for your {tokenType} token.
                  </p>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Token Type
        </button>

        <div className="text-sm text-gray-500">
          Step 2 of 5 • Choose your starting point
        </div>

        <button
          onClick={onNext}
          disabled={!selectedTemplate}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold transition-all ${
            selectedTemplate
              ? 'bg-kaspa-teal text-white hover:bg-kaspa-teal/90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Customize Features
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
