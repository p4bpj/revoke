'use client'

import './globals.css'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { config } from '@/lib/config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Kasplex Revoke - Token Allowance Manager</title>
        <meta name="description" content="Revoke your Kasplex token allowances and NFT approvals in one place" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}