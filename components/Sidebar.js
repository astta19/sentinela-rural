'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Home, Camera, AlertTriangle, MapPin, Users, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/propriedades', icon: MapPin, label: 'Propriedades' },
  { href: '/cameras', icon: Camera, label: 'Câmeras' },
  { href: '/alertas', icon: AlertTriangle, label: 'Alertas' },
  { href: '/mapa', icon: MapPin, label: 'Mapa' },
]

const adminItems = [
  { href: '/usuarios', icon: Users, label: 'Usuários', roles: ['master', 'admin'] },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
]

const roleColors = {
  master: 'badge-blue',
  admin: 'badge-green',
  operator: 'badge-yellow',
  client: 'badge-gray',
}

function SidebarContent({ onClose }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const linkClass = (href) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-white text-black font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
    }`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={15} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-none">Sentinela Rural</p>
            <p className="text-[10px] text-text-secondary font-mono mt-0.5">IA MONITORING</p>
          </div>
        </div>
        {/* Botão fechar — só aparece no drawer mobile */}
        {onClose && (
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-text-secondary uppercase tracking-widest px-2 mb-2">
          Principal
        </p>
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={linkClass(href)} onClick={onClose}>
            <Icon size={15} />
            {label}
          </Link>
        ))}

        <p className="text-[10px] font-medium text-text-secondary uppercase tracking-widest px-2 mt-4 mb-2">
          Sistema
        </p>
        {adminItems.map(({ href, icon: Icon, label, roles }) => {
          if (roles && !roles.includes(profile?.role)) return null
          return (
            <Link key={href} href={href} className={linkClass(href)} onClick={onClose}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {profile?.nome?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{profile?.nome}</p>
            <p className="text-[10px] text-text-secondary truncate">{profile?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={roleColors[profile?.role] ?? 'badge-gray'}>{profile?.role}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-red-400 transition-colors"
          >
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar — sempre visível em md+ */}
      <aside className="hidden md:flex w-56 min-h-screen bg-panel border-r border-border flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer — overlay + painel deslizante */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Painel */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-panel border-r border-border flex flex-col">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}
