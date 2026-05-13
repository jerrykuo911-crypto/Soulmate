import Link from 'next/link';
import { CHARACTERS } from '@/lib/characters';

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  size: 0.6 + (i * 7 % 3) * 0.8,
  top: (i * 37 + 11) % 100,
  left: (i * 53 + 7) % 100,
  opacity: 0.15 + (i % 5) * 0.12,
  delay: (i * 0.4) % 4,
  duration: 2.5 + (i % 4) * 0.8,
}));

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0B0820 0%, #16103A 30%, #1C0D38 55%, #0D1830 80%, #080E24 100%)',
      }}>

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            animation: 'ambient-glow 7s ease-in-out infinite',
          }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)',
            animation: 'ambient-glow 9s ease-in-out 3s infinite',
          }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)',
            animation: 'ambient-glow 11s ease-in-out 1.5s infinite',
          }} />
      </div>

      {/* Twinkling stars */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              top: `${s.top}%`,
              left: `${s.left}%`,
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Title */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-4xl" style={{ animation: 'float 5s ease-in-out infinite' }}>✦</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-2"
            style={{ color: '#F0EAFF', textShadow: '0 0 40px rgba(167,139,250,0.5)' }}>
            Soul Mate
          </h1>
          <p className="text-lg font-light tracking-[0.3em]"
            style={{ color: '#C4B5FD' }}>
            心靈陪伴
          </p>
          <p className="mt-4 text-sm max-w-xs mx-auto leading-relaxed"
            style={{ color: '#A5A0C8' }}>
            選擇一位陪伴者<br />讓今天的感受有個地方安放
          </p>
        </div>

        {/* Character Cards — full card is the enter button */}
        <div className="grid grid-cols-2 gap-5">
          {(['leo', 'mia'] as const).map((id, idx) => {
            const char = CHARACTERS[id];
            const isLeo = id === 'leo';
            return (
              <Link key={id} href={`/chat/${id}`} className="group block">
                <div
                  className="relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: isLeo
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(59,130,246,0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(236,72,153,0.1) 100%)',
                    border: isLeo
                      ? '1px solid rgba(129,140,248,0.25)'
                      : '1px solid rgba(251,113,133,0.25)',
                    minHeight: '320px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: isLeo
                      ? '0 8px 32px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
                      : '0 8px 32px rgba(244,63,94,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}>

                  {/* Glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                    style={{
                      background: isLeo
                        ? 'radial-gradient(circle at 30% 30%, rgba(129,140,248,0.12) 0%, transparent 60%)'
                        : 'radial-gradient(circle at 30% 30%, rgba(251,113,133,0.12) 0%, transparent 60%)',
                    }} />

                  {/* Avatar icon */}
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
                    style={{
                      background: isLeo
                        ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
                        : 'linear-gradient(135deg, #f43f5e, #ec4899)',
                      animation: `float 6s ease-in-out ${idx * 1.2}s infinite`,
                      boxShadow: isLeo
                        ? '0 4px 20px rgba(99,102,241,0.4)'
                        : '0 4px 20px rgba(244,63,94,0.4)',
                    }}>
                    {char.avatar}
                  </div>

                  {/* Name + title */}
                  <div className="mb-3 relative z-10">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h2 className="text-2xl font-bold" style={{ color: '#F0EAFF' }}>
                        {char.name}
                      </h2>
                      <span className="text-xs font-semibold tracking-wide"
                        style={{ color: isLeo ? '#A5B4FC' : '#FDA4AF' }}>
                        {char.title}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line"
                      style={{ color: '#B0A8D0' }}>
                      {char.description}
                    </p>
                  </div>

                  {/* Trait pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
                    {char.trait.split(' · ').map(t => (
                      <span key={t}
                        className="rounded-full px-2.5 py-0.5 text-xs"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#C8C0E8',
                        }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold relative z-10"
                    style={{ color: isLeo ? '#A5B4FC' : '#FDA4AF' }}>
                    <span>點此開始對話</span>
                    <span className="group-hover:translate-x-1.5 transition-transform inline-block">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs" style={{ color: '#4A4870' }}>
          ✦ 支援語音對話 · 情緒陪伴 · 冥想引導 ✦
        </p>
        <p className="mt-1 text-center text-xs" style={{ color: '#3A3860' }}>
          對話僅在本機儲存，不上傳至任何伺服器
        </p>
      </div>
    </main>
  );
}
