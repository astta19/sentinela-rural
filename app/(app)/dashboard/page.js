'use client'

import { useEffect, useState } from 'react'
import { MapPin, Camera, AlertTriangle, Users, Wifi, WifiOff, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export default function DashboardPage() {
  const { profile } = useAuth()
  const [supabase] = useState(() => createClient())
  const [stats, setStats] = useState({
    propriedades: 0, cameras: 0, camerasOnline: 0,
    alertas: 0, alertasNovos: 0, usuarios: 0,
  })
  const [alertasRecentes, setAlertasRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return // aguarda profile estar disponível

    async function load() {
      const [
        { count: propriedades },
        { data: cameras },
        { count: alertas },
        { count: alertasNovos },
        { count: usuarios },
        { data: recentes },
      ] = await Promise.all([
        supabase.from('propriedades').select('*', { count: 'exact', head: true }),
        supabase.from('cameras').select('status'),
        supabase.from('alertas').select('*', { count: 'exact', head: true }),
        supabase.from('alertas').select('*', { count: 'exact', head: true }).eq('status', 'novo'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('alertas')
          .select('id, tipo, nivel, status, created_at, cameras(nome, propriedades(nome))')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setStats({
        propriedades: propriedades ?? 0,
        cameras: cameras?.length ?? 0,
        camerasOnline: cameras?.filter(c => c.status === 'online').length ?? 0,
        alertas: alertas ?? 0,
        alertasNovos: alertasNovos ?? 0,
        usuarios: usuarios ?? 0,
      })
      setAlertasRecentes(recentes ?? [])
      setLoading(false)
    }

    load()
  }, [profile]) // re-executa quando profile carrega

  const levelColors = {
    baixo: 'badge-gray', medio: 'badge-yellow',
    alto: 'badge-red', critico: 'badge-red',
  }

  const cards = [
    { label: 'Propriedades', value: stats.propriedades, icon: MapPin },
    { label: 'Câmeras', value: stats.cameras, icon: Camera, sub: `${stats.camerasOnline} online`, subColor: 'text-green-400' },
    {
      label: 'Alertas', value: stats.alertas, icon: AlertTriangle,
      sub: `${stats.alertasNovos} novos`,
      subColor: stats.alertasNovos > 0 ? 'text-yellow-400' : 'text-text-secondary',
    },
    {
      label: 'Usuários ativos', value: stats.usuarios, icon: Users,
      hidden: !['master', 'admin'].includes(profile?.role),
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Bem-vindo, {profile?.nome?.split(' ')[0]}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.filter(c => !c.hidden).map(({ label, value, icon: Icon, sub, subColor }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-text-secondary">{label}</p>
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <Icon size={13} className="text-text-secondary" />
              </div>
            </div>
            <p className="text-2xl font-semibold font-mono">{loading ? '—' : value}</p>
            {sub && <p className={`text-xs mt-1 ${subColor ?? 'text-text-secondary'}`}>{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Status das câmeras</h2>
            <Activity size={14} className="text-text-secondary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <Wifi size={13} /><span>Online</span>
              </div>
              <span className="font-mono">{stats.camerasOnline}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <WifiOff size={13} /><span>Offline / Erro</span>
              </div>
              <span className="font-mono">{stats.cameras - stats.camerasOnline}</span>
            </div>
          </div>
          {stats.cameras > 0 && (
            <div className="mt-4 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{ width: `${(stats.camerasOnline / stats.cameras) * 100}%` }}
              />
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Alertas recentes</h2>
            <AlertTriangle size={14} className="text-text-secondary" />
          </div>
          {loading ? (
            <p className="text-xs text-text-secondary">Carregando...</p>
          ) : alertasRecentes.length === 0 ? (
            <p className="text-xs text-text-secondary">Nenhum alerta registrado.</p>
          ) : (
            <div className="space-y-2.5">
              {alertasRecentes.map(a => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{a.tipo}</p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {a.cameras?.propriedades?.nome} — {a.cameras?.nome}
                    </p>
                  </div>
                  <span className={`${levelColors[a.nivel]} ml-2 flex-shrink-0`}>{a.nivel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
