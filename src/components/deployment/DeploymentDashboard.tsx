'use client'

import { useState, useCallback } from 'react'
import { useWalletConnection } from '@/lib/web3modal'
import { TokenTypeSelector } from './TokenTypeSelector'
import { TemplateSelector } from './TemplateSelector'
import { FeatureBuilder } from './FeatureBuilder'
import { ContractPreview } from './ContractPreview'
import { RemixIntegration } from './RemixIntegration'
import { DeploymentHistory } from './RemixIntegration'
import type { ContractConfiguration, GeneratedContract, TokenStandard } from '@/types/deployment'
import { CONTRACT_TEMPLATES } from '@/types/deployment'
import { SolidityGenerator } from '@/lib/solidityGenerator'
import { Wallet, Rocket, Code, FileText, Settings, History } from 'lucide-react'

type DeploymentStep = 'type' | 'template' | 'features' | 'preview' | 'deploy'

export function DeploymentDashboard() {
  const { address, isConnected, chainId } = useWalletConnection()
  const [currentStep, setCurrentStep] = useState<DeploymentStep>('type')
  const [configuration, setConfiguration] = useState<Partial<ContractConfiguration>>({
    standard: 'ERC20',
    selectedFeatures: [],
    featureParameters: {},
    evmVersion: 'shanghai',
    optimizationRuns: 200
  })
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleStepChange = useCallback((step: DeploymentStep) => {
    setCurrentStep(step)
  }, [])

  const handleConfigurationUpdate = useCallback((updates: Partial<ContractConfiguration>) => {
    setConfiguration(prev => ({ ...prev, ...updates }))
  }, [])

  const handleGenerateContract = useCallback(async () => {
    if (!configuration.name || !configuration.symbol || !configuration.standard) {
      return
    }

    setIsGenerating(true)
    try {
      const fullConfig: ContractConfiguration = {
        name: configuration.name,
        symbol: configuration.symbol,
        standard: configuration.standard,
        template: configuration.template || 'basic-erc20',
        selectedFeatures: configuration.selectedFeatures || [],
        featureParameters: configuration.featureParameters || {},
        decimals: configuration.decimals || 18,
        initialSupply: configuration.initialSupply || '1000000',
        evmVersion: configuration.evmVersion || 'shanghai',
        optimizationRuns: configuration.optimizationRuns || 200,
        constructorArgs: [],
        upgradeability: configuration.upgradeability || 'none',
        accessControl: configuration.accessControl || 'ownable',
        pausable: configuration.pausable || false,
        hasTax: configuration.hasTax || false,
        hasReflection: configuration.hasReflection || false,
        hasStaking: configuration.hasStaking || false
      }

      const generator = new SolidityGenerator(fullConfig)
      const contract = generator.generate()
      
      setGeneratedContract(contract)
      setCurrentStep('preview')
    } catch (error) {
      console.error('Error generating contract:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [configuration])

  const getStepIcon = (step: DeploymentStep) => {
    switch (step) {
      case 'type': return <FileText className="w-4 h-4" />
      case 'template': return <Code className="w-4 h-4" />
      case 'features': return <Settings className="w-4 h-4" />
      case 'preview': return <Code className="w-4 h-4" />
      case 'deploy': return <Rocket className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStepTitle = (step: DeploymentStep) => {
    switch (step) {
      case 'type': return 'Choose Token Type'
      case 'template': return 'Select Template'
      case 'features': return 'Configure Features'
      case 'preview': return 'Preview Contract'
      case 'deploy': return 'Deploy & Export'
      default: return 'Unknown Step'
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-kaspa-teal mx-auto mb-4" />
          <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            Connect your wallet to start building and deploying smart contracts. 
            Create custom tokens with advanced features and deploy them directly to Remix.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            ↗️ Click &quot;Connect Wallet&quot; in the top right corner
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
        <h1 className="text-3xl font-oswald font-bold mb-2">Token Deployment Studio</h1>
        <p className="text-white/90 max-w-2xl">
          Create custom smart contracts with advanced features. Build ERC20, ERC721, and ERC1155 tokens 
          with professional-grade security and optimization.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span>Shanghai EVM Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            <span>Remix Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Security Analysis</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-oswald font-bold text-kaspa-dark-gray">
            Deployment Progress
          </h3>
          <div className="text-sm text-gray-500">
            Step {['type', 'template', 'features', 'preview', 'deploy'].indexOf(currentStep) + 1} of 5
          </div>
        </div>

        <div className="flex items-center justify-between">
          {(['type', 'template', 'features', 'preview', 'deploy'] as DeploymentStep[]).map((step, index) => {
            const isActive = step === currentStep
            const isCompleted = ['type', 'template', 'features', 'preview', 'deploy'].indexOf(currentStep) > index
            const isAccessible = index === 0 || isCompleted || ['type', 'template', 'features', 'preview', 'deploy'].indexOf(currentStep) >= index

            return (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => isAccessible && handleStepChange(step)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-oswald font-bold transition-all ${
                    isActive
                      ? 'bg-kaspa-teal text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isAccessible
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {getStepIcon(step)}
                  <span className="hidden sm:inline">{getStepTitle(step)}</span>
                </button>
                {index < 4 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 'type' && (
            <TokenTypeSelector
              selectedType={configuration.standard}
              onTypeSelect={(type) => handleConfigurationUpdate({ standard: type })}
              onNext={() => handleStepChange('template')}
            />
          )}

          {currentStep === 'template' && (
            <TemplateSelector
              tokenType={configuration.standard!}
              selectedTemplate={configuration.template}
              onTemplateSelect={(template) => handleConfigurationUpdate({ template })}
              onNext={() => handleStepChange('features')}
              onBack={() => handleStepChange('type')}
            />
          )}

          {currentStep === 'features' && (
            <FeatureBuilder
              configuration={configuration as ContractConfiguration}
              onConfigurationUpdate={handleConfigurationUpdate}
              onGenerate={handleGenerateContract}
              onBack={() => handleStepChange('template')}
              isGenerating={isGenerating}
            />
          )}

          {currentStep === 'preview' && generatedContract && (
            <ContractPreview
              contract={generatedContract}
              onEdit={() => handleStepChange('features')}
              onDeploy={() => handleStepChange('deploy')}
            />
          )}

          {currentStep === 'deploy' && generatedContract && (
            <RemixIntegration
              contract={generatedContract}
              onBack={() => handleStepChange('preview')}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Configuration Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-oswald font-bold text-kaspa-dark-gray mb-4">
              Configuration
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Token Type:</span>
                <span className="ml-2 font-medium">{configuration.standard || 'Not selected'}</span>
              </div>
              
              {configuration.name && (
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{configuration.name}</span>
                </div>
              )}
              
              {configuration.symbol && (
                <div>
                  <span className="text-gray-600">Symbol:</span>
                  <span className="ml-2 font-medium">{configuration.symbol}</span>
                </div>
              )}
              
              {configuration.template && (
                <div>
                  <span className="text-gray-600">Template:</span>
                  <span className="ml-2 font-medium">
                    {CONTRACT_TEMPLATES.find(t => t.id === configuration.template)?.name || 'Unknown'}
                  </span>
                </div>
              )}
              
              {configuration.selectedFeatures && configuration.selectedFeatures.length > 0 && (
                <div>
                  <span className="text-gray-600">Features:</span>
                  <div className="ml-2 mt-1">
                    {configuration.selectedFeatures.map(feature => (
                      <span key={feature} className="inline-block bg-kaspa-teal/10 text-kaspa-teal px-2 py-1 rounded text-xs font-medium mr-1 mb-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gas Estimation */}
          {generatedContract && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-oswald font-bold text-kaspa-dark-gray mb-4">
                Analysis
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Estimate:</span>
                  <span className="font-medium">{generatedContract.gasEstimate.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Score:</span>
                  <span className={`font-medium ${
                    generatedContract.securityScore >= 80 ? 'text-green-600' :
                    generatedContract.securityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {generatedContract.securityScore}/100
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Complexity:</span>
                  <span className="font-medium">{generatedContract.complexity}/50</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Warnings:</span>
                  <span className={`font-medium ${
                    generatedContract.warnings.length === 0 ? 'text-green-600' :
                    generatedContract.warnings.length <= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {generatedContract.warnings.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Templates */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-oswald font-bold text-kaspa-dark-gray">
                Quick Start
              </h3>
              <History className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              {CONTRACT_TEMPLATES.slice(0, 3).map(template => (
                <button
                  key={template.id}
                  onClick={() => {
                    handleConfigurationUpdate({ 
                      standard: template.baseContract,
                      template: template.id,
                      selectedFeatures: template.features
                    })
                    handleStepChange('features')
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-kaspa-teal/30 hover:bg-kaspa-teal/5 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{template.icon}</span>
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
