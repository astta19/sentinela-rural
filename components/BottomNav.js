'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Camera, AlertTriangle, Settings } from 'lucide-react'

const items = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/propriedades', icon: MapPin, label: 'Locais' },
  { href: '/cameras', icon: Camera, label: 'Câmeras' },
  { href: '/alertas', icon: AlertTriangle, label: 'Alertas' },
  { href: '/configuracoes', icon: Settings, label: 'Config' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-panel border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                active ? 'text-white' : 'text-text-secondary'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
