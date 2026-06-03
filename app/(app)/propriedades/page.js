'use client'

import { useEffect, useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

const TIPOS = ['residencial', 'comercial', 'rural']
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const emptyForm = { nome: '', tipo: 'rural', cidade: '', estado: 'SP', endereco: '', latitude: '', longitude: '' }
const tipoColors = { residencial: 'badge-gray', comercial: 'badge-blue', rural: 'badge-green' }

export default function PropriedadesPage() {
  const { profile } = useAuth()
  const [supabase] = useState(() => createClient())
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('propriedades')
      .select('*, cameras(count)')
      .order('created_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal(true) }
  const openEdit = (item) => {
    setForm({
      nome: item.nome, tipo: item.tipo, cidade: item.cidade,
      estado: item.estado, endereco: item.endereco ?? '',
      latitude: item.latitude ?? '', longitude: item.longitude ?? '',
    })
    setEditing(item.id)
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      cliente_id: profile.id,
    }
    if (editing) {
      await supabase.from('propriedades').update(payload).eq('id', editing)
    } else {
      await supabase.from('propriedades').insert(payload)
    }
    setSaving(false)
    setModal(false)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Remover propriedade e todas as câmeras vinculadas?')) return
    await supabase.from('propriedades').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Propriedades</h1>
          <p className="text-sm text-text-secondary mt-0.5">{items.length} registradas</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} />
          <span className="hidden sm:inline">Nova propriedade</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-text-secondary" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <MapPin size={32} className="text-text-secondary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Nenhuma propriedade cadastrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin size={15} className="text-text-secondary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.nome}</p>
                  <p className="text-xs text-text-secondary truncate">{item.cidade} — {item.estado}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`${tipoColors[item.tipo]} hidden sm:inline-flex`}>{item.tipo}</span>
                <span className="text-xs text-text-secondary font-mono hidden sm:block">
                  {item.cameras?.[0]?.count ?? 0} câm
                </span>
                <button onClick={() => openEdit(item)} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(item.id)} className="p-1.5 text-text-secondary hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="card w-full sm:max-w-md rounded-b-none sm:rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold">
                {editing ? 'Editar propriedade' : 'Nova propriedade'}
              </h2>
              <button onClick={() => setModal(false)} className="text-text-secondary hover:text-text-primary">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="input-label">Nome</label>
                <input className="input" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Tipo</label>
                  <select className="input" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Estado</label>
                  <select className="input" value={form.estado} onChange={e => setForm(p => ({ ...p, estado: e.target.value }))}>
                    {ESTADOS.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Cidade</label>
                <input className="input" value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Endereço</label>
                <input className="input" value={form.endereco} onChange={e => setForm(p => ({ ...p, endereco: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Latitude</label>
                  <input className="input" type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Longitude</label>
                  <input className="input" type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancelar</button>
              <button onClick={save} className="btn-primary flex-1 justify-center" disabled={saving || !form.nome || !form.cidade}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
