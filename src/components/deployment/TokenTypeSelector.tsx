'use client'

import { useState } from 'react'
import { Coins, Image, Layers, ChevronRight, Info, Zap, Users, Gamepad2 } from 'lucide-react'
import type { TokenStandard } from '@/types/deployment'

interface TokenTypeSelectorProps {
  selectedType?: TokenStandard
  onTypeSelect: (type: TokenStandard) => void
  onNext: () => void
}

const TOKEN_TYPES = [
  {
    id: 'ERC20' as TokenStandard,
    name: 'ERC20 Token',
    description: 'Fungible tokens perfect for currencies, utilities, and governance',
    icon: <Coins className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
    features: ['Fungible', 'Divisible', 'Standard transfers'],
    useCases: ['Cryptocurrencies', 'Utility tokens', 'Governance tokens', 'Rewards'],
    examples: ['USDC', 'UNI', 'COMP'],
    gasEstimate: '800K - 2M',
    complexity: 'Simple to Advanced'
  },
  {
    id: 'ERC721' as TokenStandard,
    name: 'ERC721 NFT',
    description: 'Non-fungible tokens for unique digital assets and collectibles',
    icon: <Image className="w-8 h-8" aria-label="NFT icon" />,
    color: 'from-purple-500 to-pink-500',
    features: ['Non-fungible', 'Unique IDs', 'Metadata support'],
    useCases: ['Digital art', 'Collectibles', 'Gaming items', 'Certificates'],
    examples: ['CryptoPunks', 'Bored Apes', 'ENS'],
    gasEstimate: '1.2M - 3M',
    complexity: 'Intermediate to Advanced'
  },
  {
    id: 'ERC1155' as TokenStandard,
    name: 'ERC1155 Multi-Token',
    description: 'Hybrid standard supporting both fungible and non-fungible tokens',
    icon: <Layers className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
    features: ['Multi-token', 'Batch operations', 'Gas efficient'],
    useCases: ['Gaming ecosystems', 'Multi-asset platforms', 'Complex tokenomics'],
    examples: ['Enjin', 'OpenSea', 'Horizon'],
    gasEstimate: '1.5M - 4M',
    complexity: 'Advanced to Expert'
  }
]

export function TokenTypeSelector({ selectedType, onTypeSelect, onNext }: TokenTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<TokenStandard | null>(null)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-2">
          Choose Your Token Standard
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the token standard that best fits your project. Each standard has different 
          capabilities and use cases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {TOKEN_TYPES.map((type) => {
          const isSelected = selectedType === type.id
          const isHovered = hoveredType === type.id

          return (
            <button
              key={type.id}
              onClick={() => onTypeSelect(type.id)}
              onMouseEnter={() => setHoveredType(type.id)}
              onMouseLeave={() => setHoveredType(null)}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-300 ${
                isSelected 
                  ? 'border-kaspa-teal bg-kaspa-teal/5 scale-105' 
                  : 'border-gray-200 hover:border-kaspa-teal/50 hover:scale-102'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5 ${
                isHovered ? 'opacity-10' : ''
              } transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${type.color} text-white`}>
                    {type.icon}
                  </div>
                  {isSelected && (
                    <div className="bg-kaspa-teal text-white p-1 rounded-full">
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-oswald font-bold text-kaspa-dark-gray mb-2">
                  {type.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {type.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-semibold text-gray-800">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {type.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div>
                    <span className="text-gray-500">Gas Estimate:</span>
                    <div className="font-medium">{type.gasEstimate}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Complexity:</span>
                    <div className="font-medium">{type.complexity}</div>
                  </div>
                </div>

                {/* Use Cases */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Perfect for:</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {type.useCases.slice(0, 4).map((useCase, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-kaspa-teal rounded-full" />
                        <span className="text-gray-600">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples */}
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Examples:</h4>
                  <div className="text-xs text-gray-600">
                    {type.examples.join(', ')}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Comparison Info */}
      {selectedType && (
        <div className="bg-kaspa-teal/5 border border-kaspa-teal/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-kaspa-teal mt-0.5" />
            <div>
              <h4 className="font-semibold text-kaspa-dark-gray mb-1">
                Great choice! Here&apos;s what you can expect:
              </h4>
              <div className="text-sm text-gray-700">
                {selectedType === 'ERC20' && (
                  <p>
                    ERC20 tokens are the most widely supported standard with excellent tooling, 
                    DeFi integration, and exchange listings. Perfect for most token projects.
                  </p>
                )}
                {selectedType === 'ERC721' && (
                  <p>
                    ERC721 NFTs are ideal for unique assets with individual properties. 
                    Great marketplace support and established infrastructure.
                  </p>
                )}
                {selectedType === 'ERC1155' && (
                  <p>
                    ERC1155 offers maximum flexibility with support for multiple token types 
                    in one contract. More complex but very powerful for gaming and multi-asset projects.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Step 1 of 5 • Choose your foundation
        </div>
        <button
          onClick={onNext}
          disabled={!selectedType}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-oswald font-bold transition-all ${
            selectedType
              ? 'bg-kaspa-teal text-white hover:bg-kaspa-teal/90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue to Templates
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
