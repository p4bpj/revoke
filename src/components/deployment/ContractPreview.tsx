'use client'

import { useState } from 'react'
import { ChevronLeft, Download, Copy, Eye, AlertTriangle, CheckCircle, Rocket, Code } from 'lucide-react'
import type { GeneratedContract } from '@/types/deployment'

interface ContractPreviewProps {
  contract: GeneratedContract
  onEdit: () => void
  onDeploy: () => void
}

export function ContractPreview({ contract, onEdit, onDeploy }: ContractPreviewProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'analysis' | 'deployment'>('code')
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(contract.solidity)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([contract.solidity], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contract.name}.sol`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray">
              Contract Preview
            </h2>
            <p className="text-gray-600">
              Review your generated smart contract before deployment
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Contract:</span>
            <div className="font-medium">{contract.name}</div>
          </div>
          <div>
            <span className="text-gray-500">Standard:</span>
            <div className="font-medium">{contract.configuration.standard}</div>
          </div>
          <div>
            <span className="text-gray-500">Features:</span>
            <div className="font-medium">{contract.configuration.selectedFeatures.length}</div>
          </div>
          <div>
            <span className="text-gray-500">Compiler:</span>
            <div className="font-medium">Solidity {contract.compiler}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {[
            { id: 'code', label: 'Source Code', icon: <Code className="w-4 h-4" /> },
            { id: 'analysis', label: 'Security Analysis', icon: <Eye className="w-4 h-4" /> },
            { id: 'deployment', label: 'Deployment Info', icon: <Rocket className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-kaspa-teal text-kaspa-teal'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'code' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Smart Contract Source Code</h3>
              <div className="text-sm text-gray-500">
                {contract.solidity.split('\n').length} lines
              </div>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code>{contract.solidity}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Security Score */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Security Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    contract.securityScore >= 80 ? 'text-green-600' :
                    contract.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {contract.securityScore}/100
                  </div>
                  <div className="text-sm text-gray-600">Security Score</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {contract.complexity}
                  </div>
                  <div className="text-sm text-gray-600">Complexity Level</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-kaspa-teal">
                    {(contract.gasEstimate / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Estimated Gas</div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {contract.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security Warnings</h4>
                <div className="space-y-3">
                  {contract.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        warning.type === 'critical' ? 'bg-red-50 border-red-200' :
                        warning.type === 'high' ? 'bg-orange-50 border-orange-200' :
                        warning.type === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          warning.type === 'critical' ? 'text-red-600' :
                          warning.type === 'high' ? 'text-orange-600' :
                          warning.type === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">
                            {warning.title}
                          </h5>
                          <p className="text-sm text-gray-700 mb-2">
                            {warning.description}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            Recommendation: {warning.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {contract.suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Optimization Suggestions</h4>
                <div className="space-y-3">
                  {contract.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">
                            {suggestion.title}
                          </h5>
                          <p className="text-sm text-gray-700 mb-2">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>Impact: {suggestion.impact}</span>
                            <span>Effort: {suggestion.effort}</span>
                            {suggestion.gasReduction && (
                              <span>Gas reduction: {suggestion.gasReduction.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Deployment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract Name:</span>
                      <span className="font-medium">{contract.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compiler Version:</span>
                      <span className="font-medium">{contract.compiler}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EVM Version:</span>
                      <span className="font-medium">{contract.configuration.evmVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Optimization Runs:</span>
                      <span className="font-medium">{contract.configuration.optimizationRuns}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Gas Estimates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deployment:</span>
                      <span className="font-medium">{contract.gasEstimate.toLocaleString()} gas</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost @ 20 gwei:</span>
                      <span className="font-medium">${((contract.gasEstimate * 20) / 1e9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost @ 50 gwei:</span>
                      <span className="font-medium">${((contract.gasEstimate * 50) / 1e9).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Deployment Script</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-48 text-sm">
                <code>{contract.deploymentScript}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-6 border-t bg-gray-50">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Edit Configuration
        </button>

        <div className="text-sm text-gray-500">
          Step 4 of 5 • Review contract
        </div>

        <button
          onClick={onDeploy}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold bg-kaspa-teal text-white hover:bg-kaspa-teal/90 transition-colors"
        >
          Deploy to Remix
          <Rocket className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
