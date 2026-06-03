'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix ícone padrão Leaflet no Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function MapView({ propriedades }) {
  const center = propriedades.length > 0
    ? [parseFloat(propriedades[0].latitude), parseFloat(propriedades[0].longitude)]
    : [-15.7801, -47.9292] // Brasília como fallback

  return (
    <MapContainer
      center={center}
      zoom={propriedades.length > 0 ? 12 : 4}
      style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {propriedades.map(p => (
        <Marker key={p.id} position={[parseFloat(p.latitude), parseFloat(p.longitude)]}>
          <Popup>
            <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 140 }}>
              <strong>{p.nome}</strong>
              <br />
              <small>{p.tipo}</small>
              <br />
              <small>{p.cameras?.length ?? 0} câmera(s)</small>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
