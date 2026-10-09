import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { teamInfo } from '../data/teams'
import { burst } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game, PersonId } from '../lib/types'
import { fmtDate, fmtMoney, isWeekend, resaleFor, tally, visibleGames } from '../lib/value'
import { GameCard } from './GameCard'
import { GameSheet } from './GameSheet'
import { SectionHead } from './HomeTab'
import { OpponentBadge } from './OpponentBadge'
import { Sheet } from './Sheet'
import { useToast } from './Toast'

export function LedgerTab() {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [p1, p2] = state.people
  const t1 = tally(state, 'p1')
  const t2 = tally(state, 'p2')
  const games = visibleGames(state)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [openGame, setOpenGame] = useState<Game | null>(null)
  const [from, setFrom] = useState<PersonId>('p1')
  const [gave, setGave] = useState<string | null>(null)
  const [got, setGot] = useState<string | null>(null)

  const owned = (who: PersonId) => games.filter((g) => state.assignments[g.id]?.owner === who)
  const to: PersonId = from === 'p1' ? 'p2' : 'p1'
  const selling = games.filter((g) => state.assignments[g.id]?.owner === 'sell')
  const sold = selling.filter((g) => state.assignments[g.id]?.soldFor)
  const soldTotal = sold.reduce((s, g) => s + (state.assignments[g.id]!.soldFor ?? 0), 0)
  const listedTotal = selling.filter((g) => !state.assignments[g.id]?.soldFor).reduce((s, g) => s + (resaleFor(g, state).value ?? 0) * 2, 0)

  const badges = useMemo(() => computeBadges(state, games), [state, games])

  const doTrade = () => {
    if (!gave) return
    dispatch({ type: 'trade', from, gave, got })
    burst()
    toast('Swap logged')
    setTradeOpen(false)
    setGave(null)
    setGot(null)
  }

  return (
    <div className="space-y-6">
      {/* TV score bug */}
      <section className="jumbotron p-4">
        <div className="pixel text-[9px] text-silver/80">SEASON STATS · 2026-27</div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Column p={p1} t={t1} align="left" />
          <div className="text-center">
            <div className="pixel text-[8px] text-silver/70">WEEKEND</div>
            <div className="led text-3xl sm:text-4xl">{fmt(t1.weekends)}<span className="blink mx-1 text-silver/60">:</span>{fmt(t2.weekends)}</div>
          </div>
          <Column p={p2} t={t2} align="right" />
        </div>
        <button onClick={() => setTradeOpen(true)} className="btn90 mt-4 w-full">🤝 Swap games</button>
      </section>

      <section>
        <SectionHead
          title="For sale"
          sub={sold.length || listedTotal ? `${sold.length ? `Sold ${sold.length} for ${fmtMoney(soldTotal)}` : ''}${sold.length && listedTotal ? ' · ' : ''}${listedTotal ? `Still listed ≈ ${fmtMoney(listedTotal)}` : ''}` : undefined}
        />
        {selling.length === 0 ? (
          <div className="card90 p-6 text-center text-sm font-semibold text-steel">Nothing marked for sale. Tap a game and hit “Sell it” when neither of you can make it.</div>
        ) : (
          <div className="space-y-3">
            {selling.map((g) => (
              <GameCard key={g.id} game={g} compact onClick={() => setOpenGame(g)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHead title="Trophy case" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.map((b) => (
            <motion.div key={b.title} whileHover={{ rotate: -1.5 }} className={b.holder ? 'foil p-3' : 'card90-flat p-3 opacity-60'}>
              <div className="text-3xl">{b.icon}</div>
              <div className="display mt-1 text-xl leading-tight">{b.title}</div>
              {b.holder ? (
                <span className="tag mt-1" style={{ background: b.holder.color, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>{b.holder.emoji} {b.holder.name}</span>
              ) : (
                <div className="text-xs font-semibold text-steel">{b.hint}</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Swap history" />
        {state.trades.length === 0 ? (
          <div className="card90 p-6 text-center text-sm font-semibold text-steel">No swaps yet. Keep it civil.</div>
        ) : (
          <div className="space-y-3">
            {state.trades.map((tr) => {
              const f = state.people.find((p) => p.id === tr.from)!
              const t = state.people.find((p) => p.id === tr.to)!
              const g1 = state.games.find((g) => g.id === tr.gave)
              const g2 = tr.got ? state.games.find((g) => g.id === tr.got) : null
              return (
                <div key={tr.id} className="card90-sm flex items-center gap-3 p-3 text-sm font-semibold">
                  <span className="text-xl">{f.emoji}</span>
                  <div className="flex-1">
                    <span style={{ color: f.color }}>{f.name}</span> gave {g1 ? `${g1.opponent} ${fmtDate(g1.date, { month: 'short', day: 'numeric' })}` : '?'} to <span style={{ color: t.color }}>{t.name}</span>
                    {g2 && <> for {g2.opponent} {fmtDate(g2.date, { month: 'short', day: 'numeric' })}</>}
                    <div className="text-xs text-steel">{new Date(tr.at).toLocaleDateString()}</div>
                  </div>
                  <span className="text-xl">{t.emoji}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Sheet open={tradeOpen} onClose={() => setTradeOpen(false)} title="Swap games">
        <div className="flex gap-3">
          {state.people.map((p) => (
            <button key={p.id} onClick={() => { setFrom(p.id); setGave(null); setGot(null) }} className={`btn90 sm flex-1 ${from === p.id ? 'outline outline-4 outline-yellow' : ''}`} style={{ background: p.color, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>
              {p.emoji} {p.name} gives
            </button>
          ))}
        </div>
        <Picker label={`${state.people.find((p) => p.id === from)!.name} gives up`} games={owned(from)} value={gave} onChange={setGave} />
        <Picker label={`…and gets from ${state.people.find((p) => p.id === to)!.name} (optional)`} games={owned(to)} value={got} onChange={setGot} allowNone />
        <button disabled={!gave} onClick={doTrade} className="btn90 mt-5 w-full">Make it official</button>
      </Sheet>
      <GameSheet game={openGame} onClose={() => setOpenGame(null)} />
    </div>
  )
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function Picker({ label, games, value, onChange, allowNone }: { label: string; games: Game[]; value: string | null; onChange: (v: string | null) => void; allowNone?: boolean }) {
  return (
    <div className="mt-4">
      <div className="mb-1 text-xs font-extrabold uppercase tracking-wider text-steel">{label}</div>
      <div className="scroll-hide -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        {allowNone && (
          <button onClick={() => onChange(null)} className={`card90-sm shrink-0 px-3 py-2 text-xs font-bold ${value === null ? 'outline outline-4 outline-yellow' : ''}`}>Nothing</button>
        )}
        {games.map((g) => (
          <button key={g.id} onClick={() => onChange(g.id)} className={`card90-sm flex shrink-0 items-center gap-2 p-2 text-left ${value === g.id ? 'outline outline-4 outline-yellow' : ''}`}>
            <OpponentBadge abbrev={g.opponent} size={40} />
            <div>
              <div className="text-xs font-extrabold">{fmtDate(g.date, { month: 'short', day: 'numeric' })}</div>
              <div className="text-[10px] font-bold uppercase text-steel">{isWeekend(g) ? '★ Weekend' : 'Weeknight'}</div>
            </div>
          </button>
        ))}
        {games.length === 0 && <div className="text-xs font-semibold text-steel">No games owned yet.</div>}
      </div>
    </div>
  )
}

function Column({ p, t, align }: { p: { name: string; emoji: string; color: string }; t: ReturnType<typeof tally>; align: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="pixel text-[9px]" style={{ color: p.color }}>{p.emoji} {p.name.toUpperCase()}</div>
      <div className="led mt-1 text-3xl sm:text-5xl">{fmt(t.games)}</div>
      <div className="pixel mt-1 text-[7px] leading-relaxed text-silver/70">
        GP · {fmt(t.weekends)} WKND<br />{fmt(t.weeknights)} WKNT · {fmt(t.rivals)} RIVAL
      </div>
      {t.resale > 0 && <div className="led green mt-1 text-xs">{fmtMoney(t.resale)}</div>}
    </div>
  )
}

interface Badge { icon: string; title: string; hint: string; holder: { name: string; emoji: string; color: string } | null }

function computeBadges(state: ReturnType<typeof useStore>['state'], games: Game[]): Badge[] {
  const [p1, p2] = state.people
  const count = (who: PersonId, pred: (g: Game) => boolean) => games.filter((g) => state.assignments[g.id]?.owner === who && pred(g)).length
  const lead = (a: number, b: number, min = 1) => (a === b || Math.max(a, b) < min ? null : a > b ? p1 : p2)
  return [
    { icon: '⚔️', title: 'Rivalry Hoarder', hint: 'Most rivalry games', holder: lead(count('p1', (g) => teamInfo(g.opponent).draw === 'rival'), count('p2', (g) => teamInfo(g.opponent).draw === 'rival')) },
    { icon: '🎉', title: 'Weekend Warrior', hint: 'Most weekend games', holder: lead(count('p1', isWeekend), count('p2', isWeekend)) },
    { icon: '🥱', title: 'Tuesday Hero', hint: 'Most weeknight games', holder: lead(count('p1', (g) => !isWeekend(g)), count('p2', (g) => !isWeekend(g))) },
    { icon: '🎁', title: 'Swag Collector', hint: 'Most theme nights', holder: lead(count('p1', (g) => Boolean(state.overrides[g.id]?.promo ?? g.promo)), count('p2', (g) => Boolean(state.overrides[g.id]?.promo ?? g.promo))) },
    { icon: '🥇', title: 'Opening Night', hint: 'Owns the home opener', holder: (() => { const o = games.find((g) => g.gameType === 2); const w = o && state.assignments[o.id]?.owner; return w === 'p1' ? p1 : w === 'p2' ? p2 : null })() },
    { icon: '🤝', title: 'Dealmaker', hint: 'Most swaps initiated', holder: lead(state.trades.filter((t) => t.from === 'p1').length, state.trades.filter((t) => t.from === 'p2').length) },
  ]
}
