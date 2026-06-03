'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword(form)
    if (authError) {
      setError('Email ou senha inválidos.')
      setLoading(false)
      return
    }

    // Verificar status
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('auth_user_id', user.id)
      .single()

    if (profile?.status === 'pending') {
      router.push('/auth/pending')
    } else if (profile?.status === 'blocked') {
      await supabase.auth.signOut()
      setError('Sua conta foi bloqueada. Entre em contato com o administrador.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <Shield size={18} className="text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary leading-none">Sentinela Rural</p>
            <p className="text-[11px] text-text-muted font-mono">IA MONITORING</p>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-1">Acesso ao sistema</h1>
        <p className="text-sm text-text-secondary mb-6">Entre com suas credenciais</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Entrar'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-text-secondary">
          <Link href="/auth/register" className="hover:text-text-primary transition-colors">
            Criar conta
          </Link>
          <Link href="/auth/forgot-password" className="hover:text-text-primary transition-colors">
            Esqueceu a senha?
          </Link>
        </div>
      </div>
    </div>
  )
}
