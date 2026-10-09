import { motion } from 'motion/react'
import { useState } from 'react'
import { teamInfo } from '../data/teams'
import { releaseTheKraken } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { fmtDate, fmtMoney, fmtTime, gameStart, resaleFor, tally, upcomingGames, visibleGames } from '../lib/value'
import { Countdown } from './Countdown'
import { GameCard, OwnerChip } from './GameCard'
import { GameSheet } from './GameSheet'
import { OpponentBadge } from './OpponentBadge'

export function HomeTab({ goTo }: { goTo: (tab: 'schedule' | 'ledger') => void }) {
  const { state } = useStore()
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
    .filter((g) => !state.assignments[g.id] || state.assignments[g.id]!.owner !== 'sell')
    .map((g) => ({ g, r: resaleFor(g, state) }))
    .filter((x) => x.r.value)
    .sort((a, b) => b.r.value! - a.r.value!)
    .slice(0, 3)

  return (
    <div className="space-y-5">
      {next ? (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ice/10 blur-3xl" />
          <div className="text-xs uppercase tracking-[0.25em] text-shadow">Next at Climate Pledge</div>
          <div className="mt-2 flex items-center gap-4">
            <OpponentBadge abbrev={next.opponent} size={72} />
            <div className="min-w-0">
              <div className="display text-4xl leading-none sm:text-6xl">
                <span className="text-ice">SEA</span> <span className="text-shadow">vs</span> {next.opponent}
              </div>
              <div className="mt-1 truncate text-sm text-foam/80 sm:text-base">
                {teamInfo(next.opponent).city} {teamInfo(next.opponent).name} · {fmtDate(next.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(next.time)}
              </div>
              <div className="mt-2"><OwnerChip ownerId={state.assignments[next.id]?.owner} /></div>
            </div>
          </div>
          <div className="mt-5"><Countdown to={gameStart(next)} /></div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => setOpen(next)} className="rounded-full bg-ice px-4 py-2 text-sm font-bold text-deep shadow-glow transition hover:brightness-110 active:scale-95">
              {state.assignments[next.id] ? 'Change who’s going' : 'Who’s going?'}
            </button>
            <button
              onClick={releaseTheKraken}
              className="rounded-full border border-alert/60 bg-alert/15 px-4 py-2 text-sm font-bold text-foam transition hover:bg-alert/30 active:scale-95"
            >
              🐙 Release the Kraken
            </button>
          </div>
        </motion.section>
      ) : (
        <section className="glass rounded-3xl p-6 text-center">
          <div className="display text-4xl">Season complete</div>
          <p className="text-shadow">See you next fall.</p>
        </section>
      )}

      {unassigned > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => goTo('schedule')}
          className="glass flex w-full items-center justify-between rounded-2xl border-ice/30 p-4 text-left transition hover:bg-white/10"
        >
          <div>
            <div className="display text-2xl text-ice">{unassigned} upcoming {unassigned === 1 ? 'game' : 'games'} unassigned</div>
            <div className="text-sm text-shadow">Tap a game in the schedule to decide who's going or whether to sell.</div>
          </div>
          <span className="display text-3xl text-ice">→</span>
        </motion.button>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        {[{ p: p1, t: t1 }, { p: p2, t: t2 }].map(({ p, t }) => (
          <div key={p.id} className="glass rounded-2xl p-4" style={{ borderColor: `${p.color}44` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <span className="display text-2xl" style={{ color: p.color }}>{p.name}</span>
              </div>
              <div className="display text-3xl leading-none text-foam">{fmt(t.games)} <span className="text-sm text-shadow">games</span></div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-shadow">
              <Stat n={fmt(t.weekends)} label="weekend" />
              <Stat n={fmt(t.weeknights)} label="weeknight" />
              <Stat n={t.resale ? fmtMoney(t.resale) : '—'} label="resale est." />
            </div>
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-shadow">
          <span>Weekend split</span>
          <span>
            {wkTotal === 0 ? 'No weekend games claimed yet' : Math.abs(t1.weekends - t2.weekends) < 1 ? 'Dead even 🤝' : t1.weekends > t2.weekends ? `${p1.name} has ${fmt(t1.weekends - t2.weekends)} more` : `${p2.name} has ${fmt(t2.weekends - t1.weekends)} more`}
          </span>
        </div>
        <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-abyss/60">
          <motion.div className="h-full" animate={{ width: `${pct1}%` }} style={{ background: p1.color }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
          <motion.div className="h-full flex-1" style={{ background: p2.color }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-shadow">
          <span>{p1.emoji} {fmt(t1.weekends)} weekend</span>
          <span>{played}/{games.length} played</span>
          <span>{fmt(t2.weekends)} weekend {p2.emoji}</span>
        </div>
      </section>

      {hot.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="display text-2xl text-ice">Worth the most right now</h2>
            <button className="text-sm text-shadow hover:text-ice" onClick={() => goTo('ledger')}>Ledger →</button>
          </div>
          <div className="space-y-2">
            {hot.map(({ g }) => (
              <GameCard key={g.id} game={g} compact onClick={() => setOpen(g)} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 1 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="display text-2xl text-ice">Coming up</h2>
            <button className="text-sm text-shadow hover:text-ice" onClick={() => goTo('schedule')}>Full schedule →</button>
          </div>
          <div className="space-y-2">
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

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl bg-abyss/40 py-2">
      <div className="display text-xl text-foam">{n}</div>
      <div>{label}</div>
    </div>
  )
}
