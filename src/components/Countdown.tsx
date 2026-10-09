import { useEffect, useState } from 'react'

/** Jumbotron-style LED countdown. */
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
    [d, 'DAYS'],
    [h, 'HRS'],
    [m, 'MIN'],
    [s, 'SEC'],
  ] as const
  return (
    <div className="jumbotron inline-flex items-end gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
      {cells.map(([v, label], i) => (
        <div key={label} className="flex items-end gap-2 sm:gap-3">
          <div className="text-center">
            <div className="led text-2xl sm:text-4xl">{String(v).padStart(2, '0')}</div>
            <div className="pixel mt-1 text-[7px] text-silver/70 sm:text-[8px]">{label}</div>
          </div>
          {i < cells.length - 1 && <span className="led blink mb-4 text-xl sm:mb-5 sm:text-3xl">:</span>}
        </div>
      ))}
    </div>
  )
}
