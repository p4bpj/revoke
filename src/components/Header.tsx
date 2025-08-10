import { Shield, Github } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary-500" />
            <div>
              <h1 className="font-bold text-gray-900">Kasplex Revoke</h1>
              <p className="text-xs text-gray-500">Token Allowance Manager</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}