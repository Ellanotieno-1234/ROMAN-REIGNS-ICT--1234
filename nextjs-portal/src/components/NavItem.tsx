import { ReactNode } from 'react'

interface NavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  expanded?: boolean
  onClick: () => void
}

export default function NavItem({ icon, label, active = false, expanded = true, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-2 py-3 rounded-lg w-full transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'
      }`}
    >
      <div className={expanded ? '' : 'mx-auto'}>
        {icon}
      </div>
      {expanded && <span className="ml-3 text-sm">{label}</span>}
    </button>
  )
}
