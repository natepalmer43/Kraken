import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { teamInfo } from '../data/teams'
import { krakenBurst } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game, PersonId } from '../lib/types'
import { fmtDate, fmtMoney, isWeekend, resaleFor, tally, visibleGames } from '../lib/value'
import { GameCard } from './GameCard'
import { GameSheet } from './GameSheet'
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
    krakenBurst()
    toast('Swap logged 🤝')
    setTradeOpen(false)
    setGave(null)
    setGot(null)
  }

  return (
    <div className="space-y-5">
      <section className="glass rounded-3xl p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-shadow">Season ledger</div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-2">
          <Column p={p1} t={t1} align="left" />
          <div className="display pt-1 text-center text-shadow">
            <div className="text-sm">Weekend</div>
            <div className="text-4xl text-foam">{fmt(t1.weekends)}<span className="mx-1 text-shadow">:</span>{fmt(t2.weekends)}</div>
          </div>
          <Column p={p2} t={t2} align="right" />
        </div>
        <button onClick={() => setTradeOpen(true)} className="mt-5 w-full rounded-full bg-ice px-4 py-3 font-extrabold text-deep shadow-glow active:scale-[0.98]">
          🤝 Swap games
        </button>
      </section>

      <section className="glass rounded-3xl p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="display text-2xl text-amber-200">💸 Selling</h2>
          <div className="text-right text-xs text-shadow">
            {sold.length > 0 && <div>Sold {sold.length} for <span className="text-amber-100">{fmtMoney(soldTotal)}</span></div>}
            {listedTotal > 0 && <div>Still listed ≈ <span className="text-amber-100">{fmtMoney(listedTotal)}</span></div>}
          </div>
        </div>
        {selling.length === 0 ? (
          <p className="mt-2 text-sm text-shadow">Nothing marked for sale. Tap a game and pick “Sell it” when neither of you can make it.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {selling.map((g) => (
              <GameCard key={g.id} game={g} compact onClick={() => setOpenGame(g)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="display mb-2 text-2xl text-ice">Achievements</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {badges.map((b) => (
            <motion.div key={b.title} whileHover={{ y: -2 }} className={`glass rounded-2xl p-3 ${b.holder ? '' : 'opacity-50'}`} style={b.holder ? { borderColor: `${b.holder.color}55` } : undefined}>
              <div className="text-2xl">{b.icon}</div>
              <div className="display mt-1 text-lg leading-tight">{b.title}</div>
              <div className="text-xs text-shadow">{b.holder ? `${b.holder.emoji} ${b.holder.name}` : b.hint}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-2 text-2xl text-ice">Swap history</h2>
        {state.trades.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-shadow">No swaps yet. Keep it civil.</div>
        ) : (
          <div className="space-y-2">
            {state.trades.map((tr) => {
              const f = state.people.find((p) => p.id === tr.from)!
              const t = state.people.find((p) => p.id === tr.to)!
              const g1 = state.games.find((g) => g.id === tr.gave)
              const g2 = tr.got ? state.games.find((g) => g.id === tr.got) : null
              return (
                <div key={tr.id} className="glass flex items-center gap-3 rounded-2xl p-3 text-sm">
                  <span className="text-xl">{f.emoji}</span>
                  <div className="flex-1">
                    <span style={{ color: f.color }}>{f.name}</span> gave {g1 ? `${g1.opponent} ${fmtDate(g1.date, { month: 'short', day: 'numeric' })}` : '?'} to <span style={{ color: t.color }}>{t.name}</span>
                    {g2 && <> for {g2.opponent} {fmtDate(g2.date, { month: 'short', day: 'numeric' })}</>}
                    <div className="text-xs text-shadow">{new Date(tr.at).toLocaleDateString()}</div>
                  </div>
                  <span className="text-xl">{t.emoji}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <Sheet open={tradeOpen} onClose={() => setTradeOpen(false)} title="Swap games">
        <div className="flex gap-2">
          {state.people.map((p) => (
            <button key={p.id} onClick={() => { setFrom(p.id); setGave(null); setGot(null) }} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${from === p.id ? 'ring-2 ring-foam/70' : ''}`} style={{ background: `${p.color}2a`, color: p.color, borderColor: `${p.color}66` }}>
              {p.emoji} {p.name} gives
            </button>
          ))}
        </div>
        <Picker label={`${state.people.find((p) => p.id === from)!.name} gives up`} games={owned(from)} value={gave} onChange={setGave} />
        <Picker label={`…and gets from ${state.people.find((p) => p.id === to)!.name} (optional)`} games={owned(to)} value={got} onChange={setGot} allowNone />
        <button disabled={!gave} onClick={doTrade} className="mt-4 w-full rounded-full bg-ice px-4 py-3 font-extrabold text-deep disabled:opacity-40">
          Make it official
        </button>
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
      <div className="mb-1 text-xs uppercase tracking-widest text-shadow">{label}</div>
      <div className="scroll-hide flex gap-2 overflow-x-auto pb-1">
        {allowNone && (
          <button onClick={() => onChange(null)} className={`glass shrink-0 rounded-xl px-3 py-2 text-xs ${value === null ? 'ring-2 ring-ice' : ''}`}>Nothing</button>
        )}
        {games.map((g) => (
          <button key={g.id} onClick={() => onChange(g.id)} className={`glass flex shrink-0 items-center gap-2 rounded-xl p-2 text-left ${value === g.id ? 'ring-2 ring-ice' : ''}`}>
            <OpponentBadge abbrev={g.opponent} size={34} />
            <div>
              <div className="text-xs font-semibold">{fmtDate(g.date, { month: 'short', day: 'numeric' })}</div>
              <div className="text-[10px] text-shadow">{isWeekend(g) ? 'Weekend' : 'Weeknight'}</div>
            </div>
          </button>
        ))}
        {games.length === 0 && <div className="text-xs text-shadow">No games owned yet.</div>}
      </div>
    </div>
  )
}

function Column({ p, t, align }: { p: { name: string; emoji: string; color: string }; t: ReturnType<typeof tally>; align: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="display text-2xl" style={{ color: p.color }}>{p.emoji} {p.name}</div>
      <div className="display text-5xl leading-none">{fmt(t.games)}<span className="ml-1 text-base text-shadow">games</span></div>
      <div className="mt-1 text-xs text-shadow">
        {fmt(t.weekends)} wknd · {fmt(t.weeknights)} wknight · {fmt(t.rivals)} rivalry
      </div>
      {t.resale > 0 && <div className="text-xs text-ice/80">≈ {fmtMoney(t.resale)} resale value</div>}
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
