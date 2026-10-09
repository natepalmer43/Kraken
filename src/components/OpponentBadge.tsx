import { teamInfo } from '../data/teams'

/** Slanted 90s-logo style team badge in the team's colors. */
export function OpponentBadge({ abbrev, size = 52 }: { abbrev: string; size?: number }) {
  const t = teamInfo(abbrev)
  const [a, b] = t.colors
  const light = isLight(a)
  return (
    <div
      className="display grid shrink-0 place-items-center border-[3px] border-ink"
      style={{
        width: size,
        height: size * 0.78,
        fontSize: size * 0.36,
        color: light ? '#0a0a0a' : '#fff',
        background: `linear-gradient(160deg, ${a} 0%, ${a} 58%, ${b} 58%, ${b} 100%)`,
        transform: 'skewX(-10deg)',
        boxShadow: '3px 3px 0 #0a0a0a',
        textShadow: light ? 'none' : '1px 1px 0 #0a0a0a',
      }}
      title={`${t.city} ${t.name}`}
    >
      <span style={{ transform: 'skewX(10deg)' }}>{abbrev}</span>
    </div>
  )
}

function isLight(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, bl = n & 255
  return (r * 299 + g * 587 + bl * 114) / 1000 > 150
}
