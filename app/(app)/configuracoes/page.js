'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, CheckCircle, XCircle, Ban, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const ROLES = ['master', 'admin', 'operator', 'client']
const STATUS = ['pending', 'active', 'blocked']

const statusColors = {
  pending: 'badge-yellow', active: 'badge-green', blocked: 'badge-red',
}
const roleColors = {
  master: 'badge-blue', admin: 'badge-green', operator: 'badge-yellow', client: 'badge-gray',
}

export default function UsuariosPage() {
  const { profile: me } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (me && !['master', 'admin'].includes(me.role)) {
      router.push('/dashboard')
    }
  }, [me])

  const load = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const update = async (id, patch) => {
    await supabase.from('profiles').update(patch).eq('id', id)
    load()
  }

  const fmt = (d) => new Date(d).toLocaleDateString('pt-BR')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Usuários</h1>
          <p className="text-sm text-text-secondary mt-0.5">{users.length} cadastrados</p>
        </div>
        <Users size={16} className="text-text-muted" />
      </div>

      {/* Pendentes em destaque */}
      {users.filter(u => u.status === 'pending').length > 0 && (
        <div className="card border-yellow-500/20 bg-yellow-500/5 mb-4">
          <p className="text-xs font-medium text-yellow-400 mb-3">
            ⚠ {users.filter(u => u.status === 'pending').length} usuário(s) aguardando aprovação
          </p>
          <div className="space-y-2">
            {users.filter(u => u.status === 'pending').map(u => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.nome}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => update(u.id, { status: 'active' })}
                    className="btn text-xs py-1.5 px-3 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                  >
                    <CheckCircle size={12} /> Aprovar
                  </button>
                  <button
                    onClick={() => update(u.id, { status: 'blocked' })}
                    className="btn-danger text-xs py-1.5 px-3"
                  >
                    <XCircle size={12} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-text-muted" /></div>
      ) : (
        <div className="space-y-2">
          {users.filter(u => u.status !== 'pending').map(u => (
            <div key={u.id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {u.nome?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.nome}</p>
                  <p className="text-xs text-text-muted">{u.email} · {fmt(u.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={statusColors[u.status]}>{u.status}</span>
                {me?.role === 'master' && u.id !== me?.id && (
                  <>
                    <select
                      className="input py-1 text-[11px] w-auto"
                      value={u.role}
                      onChange={e => update(u.id, { role: e.target.value })}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select
                      className="input py-1 text-[11px] w-auto"
                      value={u.status}
                      onChange={e => update(u.id, { status: e.target.value })}
                    >
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </>
                )}
                {me?.role !== 'master' && (
                  <span className={roleColors[u.role]}>{u.role}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
