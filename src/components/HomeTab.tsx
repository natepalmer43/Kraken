import { motion } from 'motion/react'
import { useState } from 'react'
import { teamInfo } from '../data/teams'
import { goalHorn } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { fmtDate, fmtMoney, fmtTime, gameStart, resaleFor, tally, upcomingGames, visibleGames } from '../lib/value'
import { Countdown } from './Countdown'
import { GameCard, OwnerChip } from './GameCard'
import { GameSheet } from './GameSheet'
import { OpponentBadge } from './OpponentBadge'
import { RecordStrip } from './ScoutingReport'

export function HomeTab({ goTo }: { goTo: (tab: 'schedule' | 'ledger') => void }) {
  const { state, standings } = useStore()
  const [open, setOpen] = useState<Game | null>(null)
  const games = visibleGames(state)
  const now = new Date()
  const upcoming = games.filter((g) => gameStart(g).getTime() + 3 * 3600000 > now.getTime())
  const next = upcoming[0]
  const unassigned = upcomingGames(state).filter((g) => !state.assignments[g.id]).length
  const played = games.length - upcoming.length
  const [p1, p2] = state.people
  const t1 = tally(state, 'p1')
  const t2 = tally(state, 'p2')
  const wkTotal = t1.weekends + t2.weekends
  const pct1 = wkTotal === 0 ? 50 : Math.round((t1.weekends / wkTotal) * 100)
  const hot = upcoming
    .filter((g) => state.assignments[g.id]?.owner !== 'sell')
    .map((g) => ({ g, r: resaleFor(g, state) }))
    .filter((x) => x.r.value)
    .sort((a, b) => b.r.value! - a.r.value!)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {next ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="foil p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="tag bg-red text-white" style={{ textShadow: '1px 1px 0 #0a0a0a' }}>Next home game</span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-steel">Climate Pledge Arena</span>
          </div>
          <div className="mt-4 flex items-center gap-3 sm:gap-5">
            <OpponentBadge abbrev="SEA" size={82} />
            <div className="display-italic text-4xl text-red outline-text sm:text-6xl">VS</div>
            <OpponentBadge abbrev={next.opponent} size={82} />
            <div className="min-w-0 flex-1">
              <div className="display text-3xl leading-none sm:text-5xl">{teamInfo(next.opponent).city} {teamInfo(next.opponent).name}</div>
              <div className="mt-1 text-sm font-bold text-steel sm:text-base">
                {fmtDate(next.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(next.time)}
              </div>
              <div className="mt-2"><OwnerChip ownerId={state.assignments[next.id]?.owner} /></div>
            </div>
          </div>
          {standings && (
            <div className="mt-4">
              <RecordStrip sea={standings.teams.SEA} opp={standings.teams[next.opponent]} opponent={next.opponent} />
            </div>
          )}
          <div className="mt-5"><Countdown to={gameStart(next)} /></div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => setOpen(next)} className="btn90">
              {state.assignments[next.id] ? 'Change who’s going' : 'Who’s going?'}
            </button>
            <button onClick={goalHorn} className="btn90 red animate-siren">🚨 Goal horn</button>
          </div>
        </motion.section>
      ) : (
        <section className="card90 p-6 text-center">
          <div className="display text-4xl">Season over</div>
          <p className="font-semibold text-steel">See you next fall.</p>
        </section>
      )}

      {unassigned > 0 && (
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => goTo('schedule')} className="card90 flex w-full items-center justify-between bg-yellow p-4 text-left">
          <div>
            <div className="display text-2xl">{unassigned} upcoming {unassigned === 1 ? 'game' : 'games'} unassigned</div>
            <div className="text-sm font-semibold">Tap a game in the schedule to decide who's going or whether to sell.</div>
          </div>
          <span className="display text-4xl">→</span>
        </motion.button>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        {[{ p: p1, t: t1 }, { p: p2, t: t2 }].map(({ p, t }) => (
          <StatCard key={p.id} p={p} t={t} />
        ))}
      </section>

      <section className="card90 p-4">
        <div className="flex items-center justify-between">
          <span className="display text-xl">Weekend split</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-steel">
            {wkTotal === 0 ? 'No weekend games claimed yet' : Math.abs(t1.weekends - t2.weekends) < 1 ? 'Dead even' : t1.weekends > t2.weekends ? `${p1.name} +${fmt(t1.weekends - t2.weekends)}` : `${p2.name} +${fmt(t2.weekends - t1.weekends)}`}
          </span>
        </div>
        <div className="mt-2 flex h-6 overflow-hidden border-2 border-ink bg-white">
          <motion.div className="h-full" animate={{ width: `${pct1}%` }} style={{ background: p1.color }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
          <div className="h-full w-1 bg-ink" />
          <motion.div className="h-full flex-1" style={{ background: p2.color }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-extrabold uppercase tracking-wider">
          <span style={{ color: p1.color }}>{p1.emoji} {fmt(t1.weekends)} weekend</span>
          <span className="text-steel">{played}/{games.length} played</span>
          <span style={{ color: p2.color }}>{fmt(t2.weekends)} weekend {p2.emoji}</span>
        </div>
      </section>

      {hot.length > 0 && (
        <section>
          <SectionHead title="Hot tickets" sub="Worth the most right now" action="Ledger →" onAction={() => goTo('ledger')} />
          <div className="space-y-3">
            {hot.map(({ g }) => (
              <GameCard key={g.id} game={g} compact onClick={() => setOpen(g)} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 1 && (
        <section>
          <SectionHead title="Coming up" action="Full schedule →" onAction={() => goTo('schedule')} />
          <div className="space-y-3">
            {upcoming.slice(1, 5).map((g) => (
              <GameCard key={g.id} game={g} compact onClick={() => setOpen(g)} />
            ))}
          </div>
        </section>
      )}

      <GameSheet game={open} onClose={() => setOpen(null)} />
    </div>
  )
}

export function SectionHead({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-end justify-between border-b-[3px] border-ink pb-1">
      <div>
        <h2 className="display-italic text-3xl">{title}</h2>
        {sub && <div className="text-xs font-extrabold uppercase tracking-wider text-steel">{sub}</div>}
      </div>
      {action && <button className="text-sm font-extrabold uppercase tracking-wider text-navy underline underline-offset-4" onClick={onAction}>{action}</button>}
    </div>
  )
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

/** Hockey-card back: name band in the person's color, then a stat table. */
function StatCard({ p, t }: { p: { name: string; emoji: string; color: string }; t: ReturnType<typeof tally> }) {
  const rows: Array<[string, string]> = [
    ['GP', fmt(t.games)],
    ['WKND', fmt(t.weekends)],
    ['WKNT', fmt(t.weeknights)],
    ['RIVAL', fmt(t.rivals)],
    ['VALUE', t.resale ? fmtMoney(t.resale) : '—'],
  ]
  return (
    <div className="card90 overflow-hidden">
      <div className="flex items-center gap-3 border-b-[3px] border-ink px-4 py-2" style={{ background: p.color }}>
        <span className="text-2xl">{p.emoji}</span>
        <span className="display-italic text-3xl text-white" style={{ textShadow: '2px 2px 0 #0a0a0a' }}>{p.name}</span>
        <span className="ml-auto text-[10px] font-extrabold uppercase tracking-widest text-white/90">2026-27 season</span>
      </div>
      <div className="grid grid-cols-5 divide-x-2 divide-ink">
        {rows.map(([k, v]) => (
          <div key={k} className="px-1 py-2 text-center">
            <div className="text-[10px] font-extrabold tracking-widest text-steel">{k}</div>
            <div className="display text-2xl">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
