'use client'

import { useEffect, useState } from 'react'
import { Camera, Plus, Pencil, Trash2, Loader2, X, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const TIPOS = ['rtsp', 'ip', 'gateway']
const emptyForm = { nome: '', tipo: 'rtsp', rtsp_url: '', usuario: '', senha: '', propriedade_id: '' }

export default function CamerasPage() {
  const supabase = createClient()
  const [items, setItems] = useState([])
  const [propriedades, setPropriedades] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(null)

  const load = async () => {
    const [{ data: cams }, { data: props }] = await Promise.all([
      supabase.from('cameras').select('*, propriedades(nome)').order('created_at', { ascending: false }),
      supabase.from('propriedades').select('id, nome').order('nome'),
    ])
    setItems(cams ?? [])
    setPropriedades(props ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ ...emptyForm, propriedade_id: propriedades[0]?.id ?? '' })
    setEditing(null)
    setModal(true)
  }

  const openEdit = (item) => {
    setForm({
      nome: item.nome, tipo: item.tipo, rtsp_url: item.rtsp_url ?? '',
      usuario: item.usuario ?? '', senha: item.senha ?? '',
      propriedade_id: item.propriedade_id,
    })
    setEditing(item.id)
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    if (editing) {
      await supabase.from('cameras').update(form).eq('id', editing)
    } else {
      await supabase.from('cameras').insert({ ...form, status: 'unknown' })
    }
    setSaving(false)
    setModal(false)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Remover câmera?')) return
    await supabase.from('cameras').delete().eq('id', id)
    load()
  }

  // Teste simulado (MVP: apenas valida se URL não está vazia)
  const testCamera = async (cam) => {
    setTesting(cam.id)
    await new Promise(r => setTimeout(r, 1500))
    const newStatus = cam.rtsp_url ? 'online' : 'offline'
    await supabase.from('cameras').update({
      status: newStatus,
      ultimo_teste: new Date().toISOString(),
    }).eq('id', cam.id)
    setTesting(null)
    load()
  }

  const statusIcon = {
    online: <Wifi size={13} className="text-green-400" />,
    offline: <WifiOff size={13} className="text-red-400" />,
    error: <AlertCircle size={13} className="text-yellow-400" />,
    unknown: <AlertCircle size={13} className="text-text-muted" />,
  }

  const statusBadge = {
    online: 'badge-green', offline: 'badge-red',
    error: 'badge-yellow', unknown: 'badge-gray',
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Câmeras</h1>
          <p className="text-sm text-text-secondary mt-0.5">{items.length} cadastradas</p>
        </div>
        <button onClick={openCreate} className="btn-primary" disabled={propriedades.length === 0}>
          <Plus size={14} /> Nova câmera
        </button>
      </div>

      {propriedades.length === 0 && !loading && (
        <div className="card text-center py-8 mb-4">
          <p className="text-sm text-text-secondary">Cadastre uma propriedade primeiro.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-text-muted" /></div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <Camera size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Nenhuma câmera cadastrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {statusIcon[item.status]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.nome}</p>
                  <p className="text-xs text-text-muted truncate">
                    {item.propriedades?.nome} · {item.tipo.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={statusBadge[item.status]}>{item.status}</span>
                <button
                  onClick={() => testCamera(item)}
                  disabled={testing === item.id}
                  className="btn-ghost py-1.5 px-2.5 text-xs"
                >
                  {testing === item.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <><RefreshCw size={12} /> Testar</>
                  }
                </button>
                <button onClick={() => openEdit(item)} className="text-text-muted hover:text-text-primary transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => remove(item.id)} className="text-text-muted hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold">{editing ? 'Editar câmera' : 'Nova câmera'}</h2>
              <button onClick={() => setModal(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
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
                  <label className="input-label">Propriedade</label>
                  <select className="input" value={form.propriedade_id} onChange={e => setForm(p => ({ ...p, propriedade_id: e.target.value }))}>
                    {propriedades.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">URL RTSP</label>
                <input className="input font-mono text-xs" placeholder="rtsp://..." value={form.rtsp_url} onChange={e => setForm(p => ({ ...p, rtsp_url: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Usuário</label>
                  <input className="input" value={form.usuario} onChange={e => setForm(p => ({ ...p, usuario: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Senha</label>
                  <input className="input" type="password" value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Cancelar</button>
              <button onClick={save} className="btn-primary flex-1 justify-center" disabled={saving || !form.nome || !form.propriedade_id}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
