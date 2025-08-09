import { useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import toast from 'react-hot-toast'
import { AlertTriangle, Wallet, Scan, RotateCcw } from 'lucide-react'

import { fetchAllApprovals, type TokenApproval } from '@/lib/approvals'
import { ERC20_ABI, ERC721_ABI } from '@/lib/contracts'
import { config, defaultChain } from '@/lib/config'
import { WalletConnector } from './WalletConnector'
import { AllowanceTable } from './AllowanceTable'
import { StatsCard } from './StatsCard'
import { LoadingSpinner } from './LoadingSpinner'

export default function WalletApp() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  
  const [approvals, setApprovals] = useState<TokenApproval[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is on the correct network
  const isOnCorrectNetwork = chainId === defaultChain.id
  const currentChainName = chainId === 1 ? 'Ethereum' : chainId === 137 ? 'Polygon' : chainId === 56 ? 'BNB Chain' : `Chain ${chainId}`

  const handleScan = useCallback(async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    setIsLoading(true)
    setError(null)
    const loadingToast = toast.loading('Scanning Kasplex blockchain for approvals...')
    
    try {
      // Always scan on Kasplex network (1337) regardless of connected network
      const fetchedApprovals = await fetchAllApprovals(address, defaultChain.id)
      setApprovals(fetchedApprovals)
      toast.success(`Found ${fetchedApprovals.length} active approvals on Kasplex`, { id: loadingToast })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to scan approvals'
      setError(errorMsg)
      toast.error(errorMsg, { id: loadingToast })
    } finally {
      setIsLoading(false)
    }
  }, [address])

  const handleRevoke = useCallback(async (tokenAddress: string, spender: string, type: 'ERC20' | 'ERC721') => {
    if (!address) return

    // Auto-switch to Kasplex network if not already connected
    if (!isOnCorrectNetwork) {
      try {
        await switchChain({ chainId: defaultChain.id })
        // Wait a moment for the network switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        toast.error(`Please switch to ${defaultChain.name} network to revoke approvals`)
        return
      }
    }

    const loadingToast = toast.loading('Revoking approval...')
    
    try {
      let hash: `0x${string}`
      
      if (type === 'ERC20') {
        hash = await writeContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender as `0x${string}`, BigInt(0)],
          chainId: defaultChain.id,
        })
      } else {
        hash = await writeContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'setApprovalForAll',
          args: [spender as `0x${string}`, false],
          chainId: defaultChain.id,
        })
      }

      await waitForTransactionReceipt(config, { hash, chainId: defaultChain.id })
      
      // Remove the revoked approval from state
      setApprovals(prev => prev.filter(approval => 
        !(approval.tokenAddress === tokenAddress && approval.spender === spender)
      ))
      
      toast.success('Approval revoked successfully', { id: loadingToast })
    } catch (error) {
      let errorMessage = 'Failed to revoke approval'
      
      if (error instanceof Error) {
        // Handle specific error types for better UX
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction was cancelled'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error, please try again'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Transaction timed out, please try again'
        }
      }
      
      toast.error(errorMessage, { id: loadingToast })
    }
  }, [address, isOnCorrectNetwork, switchChain])

  const handleBulkRevoke = useCallback(async () => {
    if (approvals.length === 0) {
      toast.error('No approvals to revoke')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to revoke ALL ${approvals.length} approvals? This will send multiple transactions and may take some time.`
    )
    
    if (!confirmed) return

    const loadingToast = toast.loading('Revoking all approvals...')
    let successCount = 0
    let errorCount = 0
    let cancelledCount = 0

    try {
      for (const approval of approvals) {
        try {
          await handleRevoke(approval.tokenAddress, approval.spender, approval.type as 'ERC20' | 'ERC721')
          successCount++
          // Small delay to avoid overwhelming the network
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          if (error instanceof Error && (error.message.includes('User rejected') || error.message.includes('User denied'))) {
            cancelledCount++
            // If user cancels one transaction, stop the bulk operation
            break
          } else {
            errorCount++
          }
        }
      }
      
      if (cancelledCount > 0) {
        toast.error('Bulk revoke cancelled by user', { id: loadingToast })
      } else if (errorCount === 0) {
        toast.success(`All ${successCount} approvals revoked successfully`, { id: loadingToast })
      } else {
        toast.success(`${successCount} approvals revoked, ${errorCount} failed`, { id: loadingToast })
      }
    } catch (error) {
      toast.error('Bulk revoke operation failed', { id: loadingToast })
    }
  }, [approvals, handleRevoke])

  const dangerousApprovals = approvals.filter(approval => approval.isDangerous)
  const activeApprovals = approvals.filter(approval => !approval.isDangerous)

  if (!isConnected) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <Wallet className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to view and manage your token allowances
        </p>
        <WalletConnector 
          onConnect={async () => connect({ connector: connectors[0] })}
          isConnecting={isConnecting}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Network Warning */}
      {!isOnCorrectNetwork && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-orange-800 font-medium">Wrong Network</p>
              <p className="text-orange-700 text-sm">
                You&apos;re connected to {currentChainName}. Please switch to {defaultChain.name} to use this app.
              </p>
            </div>
            <button
              onClick={() => switchChain({ chainId: defaultChain.id })}
              className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded text-sm font-medium transition-colors"
            >
              Switch Network
            </button>
          </div>
        </div>
      )}

      {/* Wallet Info & Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connected Wallet</h2>
            <p className="text-gray-600 font-mono text-sm break-all">{address}</p>
            {chainId && (
              <p className="text-gray-500 text-sm">
                Chain ID: {chainId} {isOnCorrectNetwork ? '✓' : '⚠️'}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Scan className="w-4 h-4" />}
              {isLoading ? 'Scanning...' : 'Scan Kasplex Approvals'}
            </button>
            <button
              onClick={() => disconnect()}
              className="btn-secondary"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {approvals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Approvals"
            value={approvals.length}
            icon={Scan}
            color="blue"
          />
          <StatsCard
            title="Dangerous Approvals"
            value={dangerousApprovals.length}
            icon={AlertTriangle}
            color="red"
          />
          <StatsCard
            title="Token Types"
            value={new Set(approvals.map(a => a.type)).size}
            icon={RotateCcw}
            color="green"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Error occurred</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Approvals Table */}
      <AllowanceTable
        approvals={approvals}
        onRevoke={handleRevoke}
        onBulkRevoke={handleBulkRevoke}
        isLoading={isLoading}
      />
    </div>
  )
}