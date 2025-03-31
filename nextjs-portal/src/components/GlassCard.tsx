import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  title?: string
}

export const GlassCard = ({ children, className = '', onClick, title }: GlassCardProps) => {
  return (
    <div 
      className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
