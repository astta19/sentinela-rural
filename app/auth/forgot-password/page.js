'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
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

        {sent ? (
          <div className="text-center">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-lg font-semibold mb-2">Email enviado</h1>
            <p className="text-sm text-text-secondary mb-6">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Link href="/auth/login" className="btn-ghost">Voltar ao login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-1">Recuperar senha</h1>
            <p className="text-sm text-text-secondary mb-6">
              Informe seu email para receber o link de recuperação.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : 'Enviar link'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-text-secondary">
              <Link href="/auth/login" className="hover:text-text-primary">Voltar ao login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
