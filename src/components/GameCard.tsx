import { motion } from 'motion/react'
import { teamInfo } from '../data/teams'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { fmtDate, fmtMoney, fmtTime, isWeekend, resaleFor } from '../lib/value'
import { OpponentBadge } from './OpponentBadge'

export function OwnerChip({ ownerId, small }: { ownerId: string | undefined; small?: boolean }) {
  const { state } = useStore()
  const sz = small ? 'text-[10px]' : 'text-xs'
  if (!ownerId) return <span className={`rounded-full border border-dashed border-ice/30 px-2 py-0.5 text-ice/60 ${sz}`}>Unassigned</span>
  if (ownerId === 'both')
    return (
      <span className={`rounded-full bg-gradient-to-r from-ice/30 to-alert/30 px-2 py-0.5 font-medium text-foam ${sz}`}>
        {state.people[0].emoji}+{state.people[1].emoji} Both going
      </span>
    )
  if (ownerId === 'sell') return <span className={`rounded-full bg-amber-400/20 px-2 py-0.5 font-medium text-amber-200 ${sz}`}>💸 Selling</span>
  const p = state.people.find((x) => x.id === ownerId)!
  return (
    <span className={`rounded-full px-2 py-0.5 font-semibold ${sz}`} style={{ background: `${p.color}33`, color: p.color }}>
      {p.emoji} {p.name}
    </span>
  )
}

export function DayChip({ game, small }: { game: Game; small?: boolean }) {
  const weekend = isWeekend(game)
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider ${small ? 'text-[9px]' : 'text-[10px]'} ${
        weekend ? 'bg-ice/20 text-ice' : 'bg-boundless/50 text-foam/70'
      }`}
    >
      {weekend ? '🎉 Weekend' : 'Weeknight'}
    </span>
  )
}

export function GameCard({ game, onClick, compact, highlight }: { game: Game; onClick?: () => void; compact?: boolean; highlight?: boolean }) {
  const { state } = useStore()
  const t = teamInfo(game.opponent)
  const a = state.assignments[game.id]
  const owner = a?.owner
  const ownerColor = owner === 'p1' || owner === 'p2' ? state.people.find((p) => p.id === owner)!.color : owner === 'both' ? '#99D9D9' : owner === 'sell' ? '#fbbf24' : 'transparent'
  const promo = state.overrides[game.id]?.promo ?? game.promo
  const past = new Date(game.date + 'T23:59:59') < new Date()
  const r = resaleFor(game, state)
  return (
    <motion.button
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`glass relative w-full overflow-hidden rounded-2xl text-left transition-colors ${past ? 'opacity-55' : ''} ${highlight ? 'ring-2 ring-ice/70' : ''} ${compact ? 'p-3' : 'p-4'}`}
    >
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: ownerColor }} />
      <div className="flex items-center gap-3 pl-1.5">
        <OpponentBadge abbrev={game.opponent} size={compact ? 44 : 54} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="display text-xl leading-none text-foam sm:text-2xl">{t.city} {t.name}</span>
            {game.gameType === 1 && <span className="rounded bg-boundless/60 px-1.5 text-[10px] uppercase tracking-wider">Preseason</span>}
          </div>
          <div className="mt-0.5 text-sm text-shadow">
            {fmtDate(game.date)} · {fmtTime(game.time)}
            {promo && <span className="ml-2 text-ice">✦ {promo}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <DayChip game={game} small />
            <OwnerChip ownerId={owner} small />
            {a?.note && <span className="truncate text-[11px] text-shadow/80">“{a.note}”</span>}
          </div>
        </div>
        <div className="text-right">
          {a?.owner === 'sell' && a.soldFor ? (
            <>
              <div className="display text-2xl leading-none text-amber-200">{fmtMoney(a.soldFor)}</div>
              <div className="text-[10px] uppercase tracking-widest text-shadow">sold</div>
            </>
          ) : (
            <>
              <div className={`display text-2xl leading-none ${r.value ? 'text-ice' : 'text-shadow/50'}`}>{r.value ? fmtMoney(r.value) : '—'}</div>
              <div className="text-[10px] uppercase tracking-widest text-shadow">{r.source === 'live' ? 'avg resale' : r.source === 'manual' ? 'resale' : 'no price'}</div>
            </>
          )}
        </div>
      </div>
    </motion.button>
  )
}
