import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: 36,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M16 4 L26 16 L16 28 L6 16 Z" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M16 9 L22 16 L16 23 L10 16 Z" fill="#FFFFFF" fillOpacity="0.15"/>
        </svg>
      </div>
    ),
    { ...size }
  )
}
