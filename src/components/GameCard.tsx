import { motion } from 'motion/react'
import { teamInfo } from '../data/teams'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { fmtDate, fmtTime, gameValue } from '../lib/value'
import { OpponentBadge } from './OpponentBadge'
import { Tentacles } from './Tentacles'

export function OwnerChip({ ownerId, small }: { ownerId: string | undefined; small?: boolean }) {
  const { state } = useStore()
  if (!ownerId) return <span className={`rounded-full border border-dashed border-ice/30 px-2 py-0.5 text-ice/60 ${small ? 'text-[10px]' : 'text-xs'}`}>Up for grabs</span>
  if (ownerId === 'both')
    return (
      <span className={`rounded-full bg-gradient-to-r from-ice/30 to-alert/30 px-2 py-0.5 font-medium text-foam ${small ? 'text-[10px]' : 'text-xs'}`}>
        {state.people[0].emoji}+{state.people[1].emoji} Both going
      </span>
    )
  if (ownerId === 'sell') return <span className={`rounded-full bg-amber-400/20 px-2 py-0.5 font-medium text-amber-200 ${small ? 'text-[10px]' : 'text-xs'}`}>💸 Selling</span>
  const p = state.people.find((x) => x.id === ownerId)!
  return (
    <span className={`rounded-full px-2 py-0.5 font-semibold ${small ? 'text-[10px]' : 'text-xs'}`} style={{ background: `${p.color}33`, color: p.color }}>
      {p.emoji} {p.name}
    </span>
  )
}

export function GameCard({ game, onClick, compact, highlight }: { game: Game; onClick?: () => void; compact?: boolean; highlight?: boolean }) {
  const { state } = useStore()
  const v = gameValue(game, state)
  const t = teamInfo(game.opponent)
  const owner = state.assignments[game.id]?.owner
  const ownerColor = owner === 'p1' || owner === 'p2' ? state.people.find((p) => p.id === owner)!.color : owner === 'both' ? '#99D9D9' : owner === 'sell' ? '#fbbf24' : 'transparent'
  const promo = state.overrides[game.id]?.promo ?? game.promo
  const past = new Date(game.date + 'T23:59:59') < new Date()
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
          <div className="mt-1.5 flex items-center gap-2">
            <OwnerChip ownerId={owner} small />
            {state.assignments[game.id]?.note && <span className="truncate text-[11px] text-shadow/80">“{state.assignments[game.id]!.note}”</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="display text-2xl leading-none text-ice">{v.total}</div>
          <div className="text-[10px] uppercase tracking-widest text-shadow">pts</div>
          <div className="mt-1"><Tentacles tier={v.tier} /></div>
        </div>
      </div>
    </motion.button>
  )
}
