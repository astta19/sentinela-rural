'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Filter, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_OPTIONS = ['todos', 'novo', 'em_analise', 'resolvido', 'ignorado']
const LEVEL_OPTIONS = ['todos', 'baixo', 'medio', 'alto', 'critico']

const levelColors = {
  baixo: 'badge-gray', medio: 'badge-yellow',
  alto: 'badge-red', critico: 'badge-red',
}
const statusColors = {
  novo: 'badge-blue', em_analise: 'badge-yellow',
  resolvido: 'badge-green', ignorado: 'badge-gray',
}

export default function AlertasPage() {
  const supabase = createClient()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterLevel, setFilterLevel] = useState('todos')

  const load = async () => {
    let q = supabase
      .from('alertas')
      .select(`id, tipo, nivel, status, observacao, created_at,
               cameras(nome, propriedades(nome))`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (filterStatus !== 'todos') q = q.eq('status', filterStatus)
    if (filterLevel !== 'todos') q = q.eq('nivel', filterLevel)

    const { data } = await q
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterStatus, filterLevel])

  const updateStatus = async (id, status) => {
    await supabase.from('alertas').update({ status }).eq('id', id)
    load()
  }

  const fmt = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Alertas</h1>
          <p className="text-sm text-text-secondary mt-0.5">{items.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-text-muted" />
          <select
            className="input py-1.5 text-xs w-auto"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="input py-1.5 text-xs w-auto"
            value={filterLevel}
            onChange={e => setFilterLevel(e.target.value)}
          >
            {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-text-muted" /></div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Nenhum alerta encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle size={13} className="text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.tipo}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {item.cameras?.propriedades?.nome} › {item.cameras?.nome}
                    </p>
                    <p className="text-[11px] text-text-muted mt-1 font-mono">{fmt(item.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={levelColors[item.nivel]}>{item.nivel}</span>
                  <span className={statusColors[item.status]}>{item.status}</span>
                  <select
                    className="input py-1 text-[11px] w-auto"
                    value={item.status}
                    onChange={e => updateStatus(item.id, e.target.value)}
                  >
                    {['novo', 'em_analise', 'resolvido', 'ignorado'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
