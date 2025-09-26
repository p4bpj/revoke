'use client'

import { useState } from 'react'
import { Shield, Link2, Search, X, AlertTriangle, Lock, Eye, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'
import { TopHeader } from '@/components/TopHeader'
import { TabNavigation, TabPanel } from '@/components/tabs/TabNavigation'
import { useWalletConnection } from '@/lib/web3modal'
import type { TabType } from '@/components/tabs/TabNavigation'

// Dynamically import the component that uses wagmi hooks to prevent hydration issues
const WalletApp = dynamic(() => import('@/components/WalletApp'), {
  ssr: false,
  loading: () => (
    <div className="card max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
      <p className="text-gray-600">Loading wallet connection...</p>
    </div>
  )
})

const ManagementDashboard = dynamic(() => import('@/components/management/ManagementDashboard').then(mod => ({ default: mod.ManagementDashboard })), {
  ssr: false,
  loading: () => (
    <div className="card max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
      <p className="text-gray-600">Loading token management...</p>
    </div>
  )
})

const DeploymentDashboard = dynamic(() => import('@/components/deployment/DeploymentDashboard').then(mod => ({ default: mod.DeploymentDashboard })), {
  ssr: false,
  loading: () => (
    <div className="card max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
      <p className="text-gray-600">Loading token deployment...</p>
    </div>
  )
})

export default function OriginalHomePage() {
  const { isConnected } = useWalletConnection()
  const [activeTab, setActiveTab] = useState<TabType>('revoke')

  return (
    <div className="min-h-screen bg-white">
      <TopHeader />
      
      {/* Hero Section - Only show when wallet is not connected */}
      {!isConnected && (
        <section className="bg-gradient-to-br from-kaspa-teal to-kaspa-bright-teal text-white py-20">
          <div className="container mx-auto px-4 text-center max-w-6xl">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-rubik font-bold mb-6">
                Take Control of Your 
                <span className="block text-white/90">Kaspa Assets</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-lato">
                When using dApps on Kaspa, you grant them permission to spend your tokens and NFTs. 
                This is called a token approval. If you don&apos;t revoke these approvals, the dApp can spend your tokens forever. 
                Clean up your approvals with KasClean.app.
              </p>
            </div>
            
            <a
              href="#main-app"
              className="bg-white text-kaspa-dark-gray font-oswald font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors shadow-lg inline-block"
            >
              Get Started
            </a>
          </div>
        </section>
      )}

      {/* Tab Navigation - Only show when wallet is connected */}
      {isConnected && (
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tokensCount={0} // This would be populated from WalletApp state
          ownedTokensCount={0} // This would be populated from ManagementDashboard state
        />
      )}

      {/* Main App Section */}
      <section id="main-app" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          {!isConnected ? (
            <WalletApp />
          ) : (
            <>
              <TabPanel value="revoke" activeTab={activeTab}>
                <WalletApp />
              </TabPanel>
              
              <TabPanel value="manage" activeTab={activeTab}>
                <ManagementDashboard />
              </TabPanel>
              
              <TabPanel value="deploy" activeTab={activeTab}>
                <DeploymentDashboard />
              </TabPanel>
            </>
          )}
        </div>
      </section>

      {/* How To Section */}
      <section className="py-20 bg-kaspa-dark-gray text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-oswald font-bold text-center mb-16">
            How To Secure Your Approvals
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-kaspa-teal rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Link2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-oswald font-bold mb-4">1. Connect</h3>
              <p className="text-gray-300 leading-relaxed">
                Click Connect Wallet on the top right or enter an address in the search bar to begin scanning.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-kaspa-teal rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-oswald font-bold mb-4">2. Inspect</h3>
              <p className="text-gray-300 leading-relaxed">
                Inspect your approvals by using the network selection, sorting and filtering options to find risky permissions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-kaspa-teal rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-oswald font-bold mb-4">3. Revoke</h3>
              <p className="text-gray-300 leading-relaxed">
                Revoke the approvals that you no longer use to prevent unwanted access to your funds and NFTs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-oswald font-bold text-kaspa-dark-gray text-center mb-16">
            Why You Should Use KasClean.app
          </h2>
          
          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-4 flex items-center gap-3">
                  <Eye className="text-kaspa-teal" />
                  1. Use KasClean.app regularly
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  It is always good to limit your approvals whenever you are not actively using a dApp, especially for NFT 
                  marketplaces. This reduces the risk of losing your funds to hacks or exploits and can also help mitigate the 
                  damage of phishing scams.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 h-48 flex items-center justify-center">
                <Shield className="w-24 h-24 text-kaspa-teal" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-50 rounded-xl p-8 h-48 flex items-center justify-center order-2 md:order-1">
                <AlertTriangle className="w-24 h-24 text-kaspa-teal" />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-4 flex items-center gap-3">
                  <AlertTriangle className="text-kaspa-teal" />
                  2. Use KasClean.app after getting scammed
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Very often, scammers try to trick you into granting them an approval to your funds. Sort your approvals by 
                  most recent to find out which approvals are to blame and revoke them to prevent further damage. 
                  Unfortunately it is not possible to recover funds that have already been stolen.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-oswald font-bold text-kaspa-dark-gray mb-4 flex items-center gap-3">
                  <Zap className="text-kaspa-teal" />
                  3. Stay ahead of threats
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Prevention is better than mitigation. Regular approval management helps you maintain a clean wallet state 
                  and reduces your attack surface. Our platform includes smart contract analysis and warning systems to help 
                  you identify potentially risky approvals before they become a problem.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 h-48 flex items-center justify-center">
                <Lock className="w-24 h-24 text-kaspa-teal" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-oswald font-bold text-kaspa-dark-gray text-center mb-16">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-oswald font-bold text-kaspa-dark-gray mb-4">
                Can I use KasClean.app to recover stolen assets?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No. KasClean.app is a <em>preventative</em> tool that helps you practice proper wallet hygiene. By regularly revoking 
                active approvals you reduce the chances of becoming the victim of approval exploits. But unfortunately it cannot be used to recover any 
                stolen funds. You should still make sure to revoke the approvals that were used to take your funds so 
                that they cannot steal more in the future.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-oswald font-bold text-kaspa-dark-gray mb-4">
                Can hardware wallets save me from approval exploits?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No. In general, hardware wallets are much safer than mobile or browser-based wallets because the 
                wallet&apos;s keys are securely stored on the device, making it impossible to steal the keys without 
                proper access to the device. But with approvals no one <em>needs</em> to steal your keys to take your tokens. 
                And because of that hardware wallets offer no extra protection against approval exploits.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-oswald font-bold text-kaspa-dark-gray mb-4">
                I want to revoke approvals, but when I add KAS to my account it gets stolen
              </h3>
              <p className="text-gray-600 leading-relaxed">
                If you have a so-called &quot;sweeper bot&quot; on your account that steals any KAS as soon as it comes in, 
                your seed phrase was compromised. This means that revoking approvals is not going to help with 
                your wallet security. Unfortunately, there is no way for your wallet to recover from this. You should 
                abandon this wallet and create a new one.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-oswald font-bold text-kaspa-dark-gray mb-4">
                Is it enough to &quot;disconnect&quot; my wallet instead of revoking approvals?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No. Disconnecting your wallet (e.g. MetaMask) does not do <em>anything</em> to protect you from approval 
                exploits - or most other exploits. The only thing that happens when disconnecting your wallet from a 
                website is that that website cannot see your address anymore. But your approvals stay active.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-kaspa-dark-gray text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-kaspa-teal" />
            <h3 className="text-2xl font-rubik font-bold">KasClean.app</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Secure your Kaspa assets by managing token approvals and NFT permissions
          </p>
          <div className="text-sm text-gray-500">
            Built for the Kaspa ecosystem • Open Source
          </div>
        </div>
      </footer>
    </div>
  )
}