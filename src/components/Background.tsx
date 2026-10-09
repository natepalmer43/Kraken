import { useMemo } from 'react'

export function Background() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const size = 6 + ((i * 37) % 26)
        return {
          left: `${(i * 47) % 100}%`,
          size,
          delay: `${-((i * 1.7) % 14)}s`,
          dur: `${11 + ((i * 3) % 9)}s`,
          dx: `${((i % 5) - 2) * 30}px`,
          o: 0.25 + ((i * 13) % 40) / 100,
        }
      }),
    [],
  )
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.dur,
            ['--dx' as string]: b.dx,
            ['--o' as string]: b.o,
          }}
        />
      ))}
      <svg className="tentacle" style={{ left: '-6vw' }} viewBox="0 0 400 600" fill="none">
        <path
          d="M40 600 C 60 500, 140 480, 160 380 C 180 280, 90 240, 120 160 C 150 80, 260 60, 300 20"
          stroke="#99D9D9" strokeWidth="46" strokeLinecap="round"
        />
        <path d="M40 600 C 60 500, 140 480, 160 380 C 180 280, 90 240, 120 160 C 150 80, 260 60, 300 20"
          stroke="#001628" strokeWidth="18" strokeLinecap="round" strokeDasharray="2 40" />
      </svg>
      <svg className="tentacle" style={{ right: '-8vw', animationDelay: '-4s', transform: 'scaleX(-1)' }} viewBox="0 0 400 600" fill="none">
        <path
          d="M60 600 C 40 480, 180 460, 170 340 C 160 230, 60 220, 90 130 C 120 50, 240 50, 320 10"
          stroke="#68A2B9" strokeWidth="40" strokeLinecap="round"
        />
        <path d="M60 600 C 40 480, 180 460, 170 340 C 160 230, 60 220, 90 130 C 120 50, 240 50, 320 10"
          stroke="#001628" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 36" />
      </svg>
    </div>
  )
}
