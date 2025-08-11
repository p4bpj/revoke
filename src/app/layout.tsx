'use client'

import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Web3ModalProvider } from '@/lib/web3modal'
import { Rubik, Oswald, Lato } from 'next/font/google'

const rubik = Rubik({ 
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
})

const oswald = Oswald({ 
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

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
        <title>KasClean.app - Kaspa Token Cleaner</title>
        <meta name="description" content="Clean up your Kaspa token allowances and NFT approvals in one place with KasClean.app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${rubik.variable} ${oswald.variable} ${lato.variable} font-lato bg-gray-50 min-h-screen`}>
        <Web3ModalProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster 
              position="top-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#231F20',
                  color: '#fff',
                },
              }}
            />
            {children}
          </QueryClientProvider>
        </Web3ModalProvider>
      </body>
    </html>
  )
}