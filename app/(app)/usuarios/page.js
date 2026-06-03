'use client'

import { useEffect, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

// Leaflet só roda no client
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapaPage() {
  const supabase = createClient()
  const [propriedades, setPropriedades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('propriedades')
      .select('id, nome, latitude, longitude, tipo, cameras(id, nome, status)')
      .not('latitude', 'is', null)
      .then(({ data }) => {
        setPropriedades(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MapPin size={16} />
        <div>
          <h1 className="text-lg font-semibold">Mapa</h1>
          <p className="text-sm text-text-secondary mt-0.5">{propriedades.length} propriedades com localização</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={20} className="animate-spin text-text-muted" /></div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-border" style={{ height: '60vh' }}>
          <MapView propriedades={propriedades} />
        </div>
      )}
    </div>
  )
}
