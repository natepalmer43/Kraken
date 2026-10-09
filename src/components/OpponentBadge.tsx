import { teamInfo } from '../data/teams'

export function OpponentBadge({ abbrev, size = 52 }: { abbrev: string; size?: number }) {
  const t = teamInfo(abbrev)
  const [a, b] = t.colors
  const light = isLight(a)
  return (
    <div
      className="display grid shrink-0 place-items-center rounded-2xl shadow-lg"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        color: light ? '#001628' : '#fff',
        background: `linear-gradient(135deg, ${a} 0%, ${a} 55%, ${b} 100%)`,
        boxShadow: `0 8px 20px ${a}55, inset 0 1px 0 rgba(255,255,255,.25)`,
      }}
      title={`${t.city} ${t.name}`}
    >
      {abbrev}
    </div>
  )
}

function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}
