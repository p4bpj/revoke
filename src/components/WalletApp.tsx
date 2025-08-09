import { useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import toast from 'react-hot-toast'
import { AlertTriangle, Wallet, Scan, RotateCcw } from 'lucide-react'

import { fetchAllApprovals, type TokenApproval } from '@/lib/approvals'
import { ERC20_ABI, ERC721_ABI } from '@/lib/contracts'
import { config } from '@/lib/config'
import { WalletConnector } from './WalletConnector'
import { AllowanceTable } from './AllowanceTable'
import { StatsCard } from './StatsCard'
import { LoadingSpinner } from './LoadingSpinner'

export default function WalletApp() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [approvals, setApprovals] = useState<TokenApproval[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScan = useCallback(async () => {
    if (!address || !chainId) {
      toast.error('Please connect your wallet first')
      return
    }
    
    setIsLoading(true)
    setError(null)
    const loadingToast = toast.loading('Scanning blockchain for approvals...')
    
    try {
      const fetchedApprovals = await fetchAllApprovals(address, chainId)
      setApprovals(fetchedApprovals)
      toast.success(`Found ${fetchedApprovals.length} active approvals`, { id: loadingToast })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to scan approvals'
      setError(errorMsg)
      toast.error(errorMsg, { id: loadingToast })
    } finally {
      setIsLoading(false)
    }
  }, [address, chainId])

  const handleRevoke = useCallback(async (tokenAddress: string, spender: string, type: 'ERC20' | 'ERC721') => {
    if (!address) return

    const loadingToast = toast.loading('Revoking approval...')
    
    try {
      let hash: `0x${string}`
      
      if (type === 'ERC20') {
        hash = await writeContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender as `0x${string}`, BigInt(0)],
        })
      } else {
        hash = await writeContract(config, {
          address: tokenAddress as `0x${string}`,
          abi: ERC721_ABI,
          functionName: 'setApprovalForAll',
          args: [spender as `0x${string}`, false],
        })
      }

      await waitForTransactionReceipt(config, { hash })
      
      // Remove the revoked approval from state
      setApprovals(prev => prev.filter(approval => 
        !(approval.tokenAddress === tokenAddress && approval.spender === spender)
      ))
      
      toast.success('Approval revoked successfully', { id: loadingToast })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to revoke approval'
      toast.error(errorMsg, { id: loadingToast })
    }
  }, [address])

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

    try {
      for (const approval of approvals) {
        try {
          await handleRevoke(approval.tokenAddress, approval.spender, approval.type as 'ERC20' | 'ERC721')
          successCount++
          // Small delay to avoid overwhelming the network
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          errorCount++
          console.error(`Failed to revoke ${approval.tokenName}:`, error)
        }
      }
      
      if (errorCount === 0) {
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
      {/* Wallet Info & Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Connected Wallet</h2>
            <p className="text-gray-600 font-mono text-sm break-all">{address}</p>
            {chainId && (
              <p className="text-gray-500 text-sm">Chain ID: {chainId}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleScan}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : <Scan className="w-4 h-4" />}
              {isLoading ? 'Scanning...' : 'Scan Approvals'}
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