import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { teamInfo } from '../data/teams'
import { krakenBurst } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { PersonId } from '../lib/types'
import { dayOfWeek, fmtDate, gameValue, tally, visibleGames } from '../lib/value'
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
  const [from, setFrom] = useState<PersonId>('p1')
  const [gave, setGave] = useState<string | null>(null)
  const [got, setGot] = useState<string | null>(null)

  const owned = (who: PersonId) => games.filter((g) => state.assignments[g.id]?.owner === who)
  const to: PersonId = from === 'p1' ? 'p2' : 'p1'
  const diff = Math.round(t1.points - t2.points)

  const badges = useMemo(() => computeBadges(state, games), [state, games])

  const doTrade = () => {
    if (!gave) return
    dispatch({ type: 'trade', from, gave, got })
    krakenBurst()
    toast('Trade logged 🤝')
    setTradeOpen(false)
    setGave(null)
    setGot(null)
  }

  return (
    <div className="space-y-5">
      <section className="glass rounded-3xl p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-shadow">Season ledger</div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Column p={p1} t={t1} align="left" />
          <div className="display text-center text-shadow">
            <div className="text-sm">{Math.abs(diff) < 6 ? 'EVEN' : 'LEAD'}</div>
            <div className="text-4xl text-foam">{Math.abs(diff)}</div>
          </div>
          <Column p={p2} t={t2} align="right" />
        </div>
        <button onClick={() => setTradeOpen(true)} className="mt-5 w-full rounded-full bg-ice px-4 py-3 font-extrabold text-deep shadow-glow active:scale-[0.98]">
          🤝 Propose a trade
        </button>
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
        <h2 className="display mb-2 text-2xl text-ice">Trade history</h2>
        {state.trades.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center text-sm text-shadow">No trades yet. Keep it civil.</div>
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

      <Sheet open={tradeOpen} onClose={() => setTradeOpen(false)} title="Propose a trade">
        <div className="flex gap-2">
          {state.people.map((p) => (
            <button key={p.id} onClick={() => { setFrom(p.id); setGave(null); setGot(null) }} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${from === p.id ? 'ring-2 ring-foam/70' : ''}`} style={{ background: `${p.color}2a`, color: p.color, borderColor: `${p.color}66` }}>
              {p.emoji} {p.name} gives
            </button>
          ))}
        </div>
        <Picker label={`${state.people.find((p) => p.id === from)!.name} gives up`} games={owned(from)} value={gave} onChange={setGave} />
        <Picker label={`…and gets from ${state.people.find((p) => p.id === to)!.name} (optional)`} games={owned(to)} value={got} onChange={setGot} allowNone />
        {gave && (
          <div className="mt-3 rounded-xl bg-abyss/50 p-3 text-xs text-shadow">
            Net swing: {state.people.find((p) => p.id === to)!.name} {netSwing(state, gave, got) >= 0 ? 'gains' : 'loses'} {Math.abs(netSwing(state, gave, got))} pts
          </div>
        )}
        <button disabled={!gave} onClick={doTrade} className="mt-4 w-full rounded-full bg-ice px-4 py-3 font-extrabold text-deep disabled:opacity-40">
          Make it official
        </button>
      </Sheet>
    </div>
  )
}

function netSwing(state: ReturnType<typeof useStore>['state'], gave: string, got: string | null) {
  const g1 = state.games.find((g) => g.id === gave)
  const g2 = got ? state.games.find((g) => g.id === got) : null
  return (g1 ? gameValue(g1, state).total : 0) - (g2 ? gameValue(g2, state).total : 0)
}

function Picker({ label, games, value, onChange, allowNone }: { label: string; games: ReturnType<typeof visibleGames>; value: string | null; onChange: (v: string | null) => void; allowNone?: boolean }) {
  const { state } = useStore()
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
              <div className="text-[10px] text-shadow">{gameValue(g, state).total} pts</div>
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
      <div className="display text-5xl leading-none">{Math.round(t.points)}</div>
      <div className="mt-1 text-xs text-shadow">
        {t.games} games · {t.weekends} wknd · {t.rivals} rivalry
      </div>
    </div>
  )
}

interface Badge { icon: string; title: string; hint: string; holder: { name: string; emoji: string; color: string } | null }

function computeBadges(state: ReturnType<typeof useStore>['state'], games: ReturnType<typeof visibleGames>): Badge[] {
  const [p1, p2] = state.people
  const count = (who: PersonId, pred: (g: (typeof games)[number]) => boolean) =>
    games.filter((g) => state.assignments[g.id]?.owner === who && pred(g)).length
  const lead = (a: number, b: number, min = 1) => (a === b || Math.max(a, b) < min ? null : a > b ? p1 : p2)
  return [
    { icon: '⚔️', title: 'Rivalry Hoarder', hint: 'Most rivalry games', holder: lead(count('p1', (g) => teamInfo(g.opponent).draw === 'rival'), count('p2', (g) => teamInfo(g.opponent).draw === 'rival')) },
    { icon: '🎉', title: 'Weekend Warrior', hint: 'Most Fri/Sat games', holder: lead(count('p1', (g) => [5, 6].includes(dayOfWeek(g.date))), count('p2', (g) => [5, 6].includes(dayOfWeek(g.date)))) },
    { icon: '🥱', title: 'Tuesday Hero', hint: 'Most weeknight games', holder: lead(count('p1', (g) => [1, 2, 3, 4].includes(dayOfWeek(g.date))), count('p2', (g) => [1, 2, 3, 4].includes(dayOfWeek(g.date)))) },
    { icon: '🎁', title: 'Swag Collector', hint: 'Most theme nights', holder: lead(count('p1', (g) => Boolean(state.overrides[g.id]?.promo ?? g.promo)), count('p2', (g) => Boolean(state.overrides[g.id]?.promo ?? g.promo))) },
    { icon: '🥇', title: 'Opening Night', hint: 'Owns the home opener', holder: (() => { const o = games.find((g) => g.gameType === 2); const w = o && state.assignments[o.id]?.owner; return w === 'p1' ? p1 : w === 'p2' ? p2 : null })() },
    { icon: '🤝', title: 'Dealmaker', hint: 'Most trades initiated', holder: lead(state.trades.filter((t) => t.from === 'p1').length, state.trades.filter((t) => t.from === 'p2').length) },
  ]
}
