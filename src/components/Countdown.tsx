import { useEffect, useState } from 'react'

export function Countdown({ to }: { to: Date }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, to.getTime() - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  const cells = [
    [d, 'days'],
    [h, 'hrs'],
    [m, 'min'],
    [s, 'sec'],
  ] as const
  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {cells.map(([v, label], i) => (
        <div key={label} className="flex items-end gap-2 sm:gap-3">
          <div className="text-center">
            <div className="display glass rounded-xl px-2 py-1 text-3xl tabular-nums leading-none text-ice sm:px-3 sm:text-5xl">
              {String(v).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-shadow">{label}</div>
          </div>
          {i < cells.length - 1 && <span className="display mb-5 text-2xl text-shadow/60">:</span>}
        </div>
      ))}
    </div>
  )
}
