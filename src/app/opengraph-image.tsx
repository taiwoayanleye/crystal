import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Crystal — Data-as-a-Product Platform'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32">
              <path d="M16 4 L26 16 L16 28 L6 16 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M16 9 L22 16 L16 23 L10 16 Z" fill="#FFFFFF" fillOpacity="0.15"/>
            </svg>
          </div>
          <span style={{ fontSize: 56, fontWeight: 700, color: '#FFFFFF', letterSpacing: -1 }}>
            Crystal
          </span>
        </div>
        <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', maxWidth: 600, textAlign: 'center' }}>
          Data-as-a-Product Platform
        </span>
        <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
          Quality signals, outcome tracking, and source lineage
        </span>
      </div>
    ),
    { ...size }
  )
}
