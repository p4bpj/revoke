'use client'

import { useState } from 'react'
import { Shield, Settings, RotateCcw, Wrench, Rocket } from 'lucide-react'

export type TabType = 'revoke' | 'manage' | 'deploy'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  tokensCount?: number
  ownedTokensCount?: number
  templatesCount?: number
}

export function TabNavigation({ 
  activeTab, 
  onTabChange, 
  tokensCount = 0,
  ownedTokensCount = 0,
  templatesCount = 8
}: TabNavigationProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1 max-w-2xl">
            {/* Revoke Approvals Tab */}
            <button
              onClick={() => onTabChange('revoke')}
              className={`flex items-center gap-2 px-6 py-3 rounded-md font-oswald font-bold transition-all duration-200 ${
                activeTab === 'revoke'
                  ? 'bg-kaspa-teal text-white shadow-md'
                  : 'text-kaspa-dark-gray hover:text-kaspa-teal hover:bg-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Revoke Approvals</span>
              {tokensCount > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'revoke'
                    ? 'bg-white/20 text-white'
                    : 'bg-kaspa-teal/10 text-kaspa-teal'
                }`}>
                  {tokensCount}
                </span>
              )}
            </button>

            {/* Manage Tokens Tab */}
            <button
              onClick={() => onTabChange('manage')}
              className={`flex items-center gap-2 px-4 py-3 rounded-md font-oswald font-bold transition-all duration-200 ${
                activeTab === 'manage'
                  ? 'bg-kaspa-teal text-white shadow-md'
                  : 'text-kaspa-dark-gray hover:text-kaspa-teal hover:bg-white'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Manage Tokens</span>
              {ownedTokensCount > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'manage'
                    ? 'bg-white/20 text-white'
                    : 'bg-kaspa-teal/10 text-kaspa-teal'
                }`}>
                  {ownedTokensCount}
                </span>
              )}
            </button>

            {/* Deploy Token Tab */}
            <button
              onClick={() => onTabChange('deploy')}
              className={`flex items-center gap-2 px-4 py-3 rounded-md font-oswald font-bold transition-all duration-200 ${
                activeTab === 'deploy'
                  ? 'bg-kaspa-teal text-white shadow-md'
                  : 'text-kaspa-dark-gray hover:text-kaspa-teal hover:bg-white'
              }`}
            >
              <Rocket className="w-4 h-4" />
              <span>Deploy Token</span>
              {templatesCount > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'deploy'
                    ? 'bg-white/20 text-white'
                    : 'bg-kaspa-teal/10 text-kaspa-teal'
                }`}>
                  {templatesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab content wrapper
interface TabContentProps {
  activeTab: TabType
  children: React.ReactNode
}

export function TabContent({ activeTab, children }: TabContentProps) {
  return (
    <div className="tab-content">
      {children}
    </div>
  )
}

// Individual tab panels
interface TabPanelProps {
  value: TabType
  activeTab: TabType
  children: React.ReactNode
}

export function TabPanel({ value, activeTab, children }: TabPanelProps) {
  if (value !== activeTab) return null
  
  return (
    <div className="tab-panel animate-fadeIn">
      {children}
    </div>
  )
}
