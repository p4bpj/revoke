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

    const loadingToast = toast.loading('Preparing to revoke approval...')

    try {
      // Check if user is on correct network before proceeding
      if (chainId !== defaultChain.id) {
        console.error(`Wrong network detected. Current: ${chainId}, Expected: ${defaultChain.id}`)
        toast.error(`Wrong network! Please manually switch to ${defaultChain.name} (Chain ID: ${defaultChain.id}) in your wallet and try again.`, { id: loadingToast })
        return
      }
      
      toast.loading('Revoking approval on Kasplex...', { id: loadingToast })

      console.log('Attempting to revoke:', { tokenAddress, spender, type, chainId: defaultChain.id })
      
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

      console.log('Transaction submitted:', hash)
      toast.loading('Waiting for confirmation...', { id: loadingToast })

      await waitForTransactionReceipt(config, { hash, chainId: defaultChain.id })
      
      console.log('Transaction confirmed:', hash)
      
      // Remove the revoked approval from state
      setApprovals(prev => prev.filter(approval => 
        !(approval.tokenAddress === tokenAddress && approval.spender === spender)
      ))
      
      toast.success('Approval revoked successfully!', { id: loadingToast })
    } catch (error) {
      console.error('Revoke error:', error)
      
      let errorMessage = 'Failed to revoke approval'
      
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack)
        
        // Handle specific error types for better UX
        if (error.message.includes('User rejected') || error.message.includes('User denied') || error.message.includes('rejected')) {
          errorMessage = 'Transaction was cancelled by user'
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for gas fees'
        } else if (error.message.includes('invalid argument 0: json: cannot unmarshal hex string without 0x prefix')) {
          errorMessage = 'Unable to process the revoke, please retry'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          errorMessage = 'RPC is not available'
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network connection error, please try again'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Transaction timed out, please try again'
        } else if (error.message.includes('chainId')) {
          errorMessage = 'Wrong network - please ensure you are on Kasplex'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      toast.error(errorMessage, { id: loadingToast })
    }
  }, [address, chainId])

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
    const totalCount = approvals.length
    const revokePromises: Promise<boolean>[] = []

    // Create individual revoke promises that return success/failure
    for (const approval of approvals) {
      const revokePromise = (async () => {
        try {
          if (!address) return false
          
          // Check if user is on correct network
          if (chainId !== defaultChain.id) {
            return false
          }
          
          let hash: `0x${string}`
          
          if (approval.type === 'ERC20') {
            hash = await writeContract(config, {
              address: approval.tokenAddress as `0x${string}`,
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [approval.spender as `0x${string}`, BigInt(0)],
              chainId: defaultChain.id,
            })
          } else {
            hash = await writeContract(config, {
              address: approval.tokenAddress as `0x${string}`,
              abi: ERC721_ABI,
              functionName: 'setApprovalForAll',
              args: [approval.spender as `0x${string}`, false],
              chainId: defaultChain.id,
            })
          }

          await waitForTransactionReceipt(config, { hash, chainId: defaultChain.id })
          
          // Remove from state on success
          setApprovals(prev => prev.filter(a => 
            !(a.tokenAddress === approval.tokenAddress && a.spender === approval.spender)
          ))
          
          return true
        } catch (error) {
          return false
        }
      })()
      
      revokePromises.push(revokePromise)
      
      // Small delay between starting each transaction
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Wait for all transactions to complete
    const results = await Promise.all(revokePromises)
    successCount = results.filter(success => success).length
    errorCount = results.filter(success => !success).length
    
    if (errorCount === 0 && successCount > 0) {
      toast.success(`All ${successCount} approvals revoked successfully`, { id: loadingToast })
    } else if (successCount > 0) {
      toast.warning(`${successCount} approvals revoked, ${errorCount} failed`, { id: loadingToast })
    } else {
      toast.error('All revoke attempts failed', { id: loadingToast })
    }
  }, [approvals, handleRevoke, address, chainId])

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