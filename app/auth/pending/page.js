import Link from 'next/link'
import { Shield, Clock } from 'lucide-react'

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
          <Clock size={24} className="text-yellow-400" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Aguardando aprovação</h1>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Sua conta foi criada e está aguardando aprovação de um administrador.
          Você receberá acesso em breve.
        </p>
        <Link href="/auth/login" className="btn-ghost text-xs">
          <Shield size={13} />
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
