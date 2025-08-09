import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'red' | 'green' | 'purple'
}

export function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    red: 'text-red-600 bg-red-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}