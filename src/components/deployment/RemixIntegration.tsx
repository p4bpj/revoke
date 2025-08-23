'use client'

import { useState } from 'react'
import { ChevronLeft, ExternalLink, Copy, Download, Rocket, Code, FileText } from 'lucide-react'
import type { GeneratedContract } from '@/types/deployment'
import { exportToRemix, generateHardhatConfig } from '@/lib/solidityGenerator'

interface RemixIntegrationProps {
  contract: GeneratedContract
  onBack: () => void
}

export function RemixIntegration({ contract, onBack }: RemixIntegrationProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [deploymentMethod, setDeploymentMethod] = useState<'remix' | 'hardhat'>('remix')

  const handleCopy = async (text: string, itemName: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedItem(itemName)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const handleRemixDeploy = () => {
    const remixWorkspace = exportToRemix(contract)
    const blob = new Blob([remixWorkspace], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Open Remix in new tab
    window.open('https://remix.ethereum.org', '_blank')
    
    // Download workspace file
    const a = document.createElement('a')
    a.href = url
    a.download = `${contract.name}_workspace.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadHardhat = () => {
    const files = {
      [`contracts/${contract.name}.sol`]: contract.solidity,
      'hardhat.config.js': generateHardhatConfig(contract),
      'scripts/deploy.js': contract.deploymentScript,
      'package.json': JSON.stringify({
        name: contract.name.toLowerCase(),
        version: '1.0.0',
        scripts: {
          compile: 'hardhat compile',
          deploy: 'hardhat run scripts/deploy.js',
          verify: 'hardhat verify'
        },
        devDependencies: {
          '@nomicfoundation/hardhat-toolbox': '^3.0.0',
          '@nomiclabs/hardhat-etherscan': '^3.1.0',
          'hardhat': '^2.17.0'
        }
      }, null, 2)
    }

    // Create ZIP file (simplified - in production use JSZip)
    Object.entries(files).forEach(([filename, content]) => {
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace('/', '_')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-2">
          Deploy Your Contract
        </h2>
        <p className="text-gray-600">
          Export to Remix IDE or download Hardhat project for deployment
        </p>
      </div>

      {/* Deployment Method Selection */}
      <div className="p-6 border-b">
        <h3 className="font-semibold text-gray-900 mb-4">Choose Deployment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setDeploymentMethod('remix')}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              deploymentMethod === 'remix'
                ? 'border-kaspa-teal bg-kaspa-teal/5'
                : 'border-gray-200 hover:border-kaspa-teal/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Remix IDE</h4>
                <p className="text-sm text-gray-600">Browser-based development</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• No setup required</li>
              <li>• Direct blockchain deployment</li>
              <li>• Built-in testing tools</li>
              <li>• Perfect for beginners</li>
            </ul>
          </button>

          <button
            onClick={() => setDeploymentMethod('hardhat')}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              deploymentMethod === 'hardhat'
                ? 'border-kaspa-teal bg-kaspa-teal/5'
                : 'border-gray-200 hover:border-kaspa-teal/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Hardhat Framework</h4>
                <p className="text-sm text-gray-600">Professional development</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Advanced testing framework</li>
              <li>• Plugin ecosystem</li>
              <li>• Local blockchain simulation</li>
              <li>• CI/CD integration</li>
            </ul>
          </button>
        </div>
      </div>

      {/* Deployment Instructions */}
      <div className="p-6">
        {deploymentMethod === 'remix' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Deploy with Remix IDE</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Quick Deploy Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click &quot;Open Remix&quot; to launch the IDE</li>
                  <li>Create a new file: {contract.name}.sol</li>
                  <li>Paste the contract code</li>
                  <li>Compile with Solidity {contract.compiler}</li>
                  <li>Deploy to your preferred network</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRemixDeploy}
                  className="flex items-center gap-2 px-6 py-3 bg-kaspa-teal text-white rounded-lg hover:bg-kaspa-teal/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Remix IDE
                </button>
                
                <button
                  onClick={() => handleCopy(contract.solidity, 'contract')}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copiedItem === 'contract' ? 'Copied!' : 'Copy Contract'}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contract Source Code</h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 text-sm">
                  <code>{contract.solidity}</code>
                </pre>
                <button
                  onClick={() => handleCopy(contract.solidity, 'source')}
                  className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                  title="Copy source code"
                >
                  <Copy className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {deploymentMethod === 'hardhat' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Setup Hardhat Project</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-900 mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Download the project files</li>
                  <li>Run: npm install</li>
                  <li>Configure your .env file</li>
                  <li>Run: npx hardhat compile</li>
                  <li>Run: npx hardhat run scripts/deploy.js</li>
                </ol>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleDownloadHardhat}
                  className="flex items-center gap-2 px-6 py-3 bg-kaspa-teal text-white rounded-lg hover:bg-kaspa-teal/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Project
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Environment Setup</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800">
{`# .env file
PRIVATE_KEY=your_private_key
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Deploy Commands</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm">
                    <code className="text-kaspa-teal">npm install</code>
                    <span className="text-gray-600 ml-2"># Install dependencies</span>
                  </div>
                  <div className="text-sm">
                    <code className="text-kaspa-teal">npx hardhat compile</code>
                    <span className="text-gray-600 ml-2"># Compile contract</span>
                  </div>
                  <div className="text-sm">
                    <code className="text-kaspa-teal">npx hardhat run scripts/deploy.js</code>
                    <span className="text-gray-600 ml-2"># Deploy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Network Information */}
      <div className="p-6 border-t bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">Network Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Kasplex Mainnet</h4>
            <div className="space-y-1 text-gray-600">
              <div>Chain ID: 167012</div>
              <div>RPC: wss://kasplextest.xyz/</div>
              <div>Explorer: https://explorer.testnet.kasplextest.xyz/</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Gas Settings</h4>
            <div className="space-y-1 text-gray-600">
              <div>Gas Limit: {contract.gasEstimate.toLocaleString()}</div>
              <div>Gas Price: 20 gwei</div>
              <div>Est. Cost: ${((contract.gasEstimate * 20) / 1e9).toFixed(2)}</div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">Verification</h4>
            <div className="space-y-1 text-gray-600">
              <div>Compiler: {contract.compiler}</div>
              <div>EVM: {contract.configuration.evmVersion}</div>
              <div>Optimization: {contract.configuration.optimizationRuns} runs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Preview
        </button>

        <div className="text-sm text-gray-500">
          Step 5 of 5 • Ready to deploy
        </div>

        <div className="flex items-center gap-2 text-green-600">
          <Rocket className="w-4 h-4" />
          <span className="font-medium text-sm">Contract Ready!</span>
        </div>
      </div>
    </div>
  )
}

// Placeholder for DeploymentHistory component
export function DeploymentHistory() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-oswald font-bold text-kaspa-dark-gray mb-4">
        Deployment History
      </h3>
      <div className="text-center py-8 text-gray-500">
        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3" />
        <p className="text-sm">No deployments yet</p>
        <p className="text-xs text-gray-400">Your deployment history will appear here</p>
      </div>
    </div>
  )
}
