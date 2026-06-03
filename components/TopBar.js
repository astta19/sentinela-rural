'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'

const titles = {
  '/dashboard': 'Dashboard',
  '/propriedades': 'Propriedades',
  '/cameras': 'Câmeras',
  '/alertas': 'Alertas',
  '/mapa': 'Mapa',
  '/usuarios': 'Usuários',
  '/configuracoes': 'Configurações',
}

export default function TopBar({ onMenuClick }) {
  const pathname = usePathname()
  const title = Object.entries(titles).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'Sentinela Rural'

  return (
    <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-panel border-b border-border sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="text-text-secondary hover:text-text-primary transition-colors"
      >
        <Menu size={20} />
      </button>
      <p className="text-sm font-semibold">{title}</p>
    </header>
  )
}
