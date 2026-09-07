import { ImageResponse } from 'next/og';
import { personal } from '@/content/profile';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#050507',
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(51,225,230,0.25), transparent 45%), radial-gradient(circle at 85% 85%, rgba(139,92,246,0.25), transparent 45%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#33e1e6', fontSize: 24, fontFamily: 'monospace' }}>
          <span>~/{personal.name.toLowerCase().replace(' ', '-')}</span>
        </div>
        <div style={{ display: 'flex', color: '#ffffff', fontSize: 76, fontWeight: 700, marginTop: 24 }}>{personal.name}</div>
        <div style={{ display: 'flex', color: '#33e1e6', fontSize: 32, marginTop: 16, fontFamily: 'monospace' }}>
          {personal.subtitle}
        </div>
        <div style={{ display: 'flex', color: 'rgba(255,255,255,0.6)', fontSize: 26, marginTop: 28, maxWidth: 900 }}>
          {personal.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
