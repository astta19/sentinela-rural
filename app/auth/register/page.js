'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ nome: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      auth_user_id: data.user.id,
      nome: form.nome,
      email: form.email,
    })

    if (profileError) {
      setError('Erro ao criar perfil. Tente novamente.')
      setLoading(false)
      return
    }

    // Verificar se virou master (primeiro usuário)
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('auth_user_id', data.user.id)
      .single()

    if (profile?.role === 'master') {
      router.push('/dashboard')
    } else {
      router.push('/auth/pending')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Sentinela Rural</p>
            <p className="text-[11px] text-text-muted font-mono">IA MONITORING</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-1">Criar conta</h1>
        <p className="text-sm text-text-secondary mb-6">Preencha os dados para solicitar acesso</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nome completo</label>
            <input
              type="text"
              className="input"
              placeholder="João Silva"
              value={form.nome}
              onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="input-label">Senha</label>
            <input
              type="password"
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Solicitar acesso'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-text-secondary">
          Já tem conta?{' '}
          <Link href="/auth/login" className="text-text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
