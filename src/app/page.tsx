'use client'

import { Shield } from 'lucide-react'

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-kaspa-teal" />
            <h1 className="text-3xl font-rubik font-bold text-kaspa-dark-gray">KasClean.app</h1>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-oswald font-bold text-kaspa-dark-gray mb-6">
              Service Cancelled
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Due to the lack of funding, this service has been cancelled.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mt-4">
              Thank you for visiting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}