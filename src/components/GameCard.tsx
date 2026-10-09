import { motion } from 'motion/react'
import { teamInfo } from '../data/teams'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { fmtDate, fmtMoney, fmtTime, isWeekend, resaleFor } from '../lib/value'
import { OpponentBadge } from './OpponentBadge'

export function OwnerChip({ ownerId }: { ownerId: string | undefined }) {
  const { state } = useStore()
  if (!ownerId) return <span className="tag dashed">Unassigned</span>
  if (ownerId === 'both')
    return (
      <span className="tag" style={{ background: `linear-gradient(90deg, ${state.people[0].color} 50%, ${state.people[1].color} 50%)`, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>
        {state.people[0].emoji}+{state.people[1].emoji} Both
      </span>
    )
  if (ownerId === 'sell') return <span className="tag bg-yellow">💸 Selling</span>
  const p = state.people.find((x) => x.id === ownerId)!
  return (
    <span className="tag" style={{ background: p.color, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>
      {p.emoji} {p.name}
    </span>
  )
}

export function DayChip({ game }: { game: Game }) {
  return isWeekend(game) ? <span className="tag bg-teal text-ink">★ Weekend</span> : <span className="tag bg-white text-steel">Weeknight</span>
}

/** A horizontal 90s trading card. */
export function GameCard({ game, onClick, compact, highlight }: { game: Game; onClick?: () => void; compact?: boolean; highlight?: boolean }) {
  const { state } = useStore()
  const t = teamInfo(game.opponent)
  const [c1, c2] = t.colors
  const a = state.assignments[game.id]
  const owner = a?.owner
  const ownerColor = owner === 'p1' || owner === 'p2' ? state.people.find((p) => p.id === owner)!.color : owner === 'both' ? '#5B2A86' : owner === 'sell' ? '#FFC914' : '#C9CED6'
  const promo = state.overrides[game.id]?.promo ?? game.promo
  const past = new Date(game.date + 'T23:59:59') < new Date()
  const r = resaleFor(game, state)
  return (
    <motion.button
      layout
      whileHover={{ x: -2, y: -2 }}
      whileTap={{ x: 2, y: 2 }}
      onClick={onClick}
      className={`card90-sm relative w-full overflow-hidden text-left ${past ? 'opacity-60 saturate-50' : ''} ${highlight ? 'outline outline-4 outline-yellow' : ''}`}
    >
      {/* diagonal team-color band behind the badge */}
      <div
        className="absolute inset-y-0 left-0"
        style={{ width: compact ? 88 : 100, background: `linear-gradient(115deg, ${c1} 0 62%, ${c2} 62% 72%, ${ownerColor} 72% 100%)`, clipPath: 'polygon(0 0, 88% 0, 62% 100%, 0 100%)' }}
      />
      <div className={`relative flex items-center gap-3 ${compact ? 'p-2.5' : 'p-3'}`}>
        <OpponentBadge abbrev={game.opponent} size={compact ? 56 : 66} />
        <div className={`min-w-0 flex-1 ${compact ? 'pl-2' : 'pl-1'}`}>
          <div className="flex items-baseline gap-2">
            <span className={`display ${compact ? 'text-xl' : 'text-2xl'}`}>{t.city} {t.name}</span>
            {game.gameType === 1 && <span className="tag">Pre</span>}
          </div>
          <div className="mt-0.5 text-sm font-semibold text-steel">
            {fmtDate(game.date)} · {fmtTime(game.time)}
            {promo && <span className="ml-2 font-bold text-purple">✦ {promo}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DayChip game={game} />
            <OwnerChip ownerId={owner} />
            {a?.note && <span className="truncate text-xs italic text-steel">“{a.note}”</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {a?.owner === 'sell' && a.soldFor ? (
            <>
              <div className="display text-2xl text-red">{fmtMoney(a.soldFor)}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-steel">sold</div>
            </>
          ) : (
            <>
              <div className={`display text-2xl ${r.value ? 'text-navy' : 'text-silver'}`}>{r.value ? fmtMoney(r.value) : '—'}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-steel">{r.source === 'live' ? 'avg resale' : r.source === 'manual' ? 'resale' : 'no price'}</div>
            </>
          )}
        </div>
      </div>
      {/* bottom "stat line" rule like a card back */}
      <div className="stripe-thin h-1.5 border-t-2 border-ink" style={{ ['--s1' as string]: ownerColor, ['--s2' as string]: '#fff' }} />
    </motion.button>
  )
}
