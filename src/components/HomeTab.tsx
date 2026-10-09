import { motion } from 'motion/react'
import { useState } from 'react'
import { teamInfo } from '../data/teams'
import { releaseTheKraken } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { fmtDate, fmtTime, gameStart, tally, visibleGames } from '../lib/value'
import { Countdown } from './Countdown'
import { GameCard, OwnerChip } from './GameCard'
import { GameSheet } from './GameSheet'
import { OpponentBadge } from './OpponentBadge'

export function HomeTab({ goTo }: { goTo: (tab: 'schedule' | 'draft') => void }) {
  const { state } = useStore()
  const [open, setOpen] = useState<Game | null>(null)
  const games = visibleGames(state)
  const now = new Date()
  const upcoming = games.filter((g) => gameStart(g).getTime() + 3 * 3600000 > now.getTime())
  const next = upcoming[0]
  const unassigned = games.filter((g) => !state.assignments[g.id]).length
  const played = games.length - upcoming.length
  const [p1, p2] = state.people
  const t1 = tally(state, 'p1')
  const t2 = tally(state, 'p2')
  const total = t1.points + t2.points
  const pct1 = total === 0 ? 50 : Math.round((t1.points / total) * 100)

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

      {unassigned > 0 && state.draft.status === 'idle' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => goTo('draft')}
          className="glass flex w-full items-center justify-between rounded-2xl border-ice/30 p-4 text-left transition hover:bg-white/10"
        >
          <div>
            <div className="display text-2xl text-ice">{unassigned} games up for grabs</div>
            <div className="text-sm text-shadow">Run a snake draft to split them fairly, or tap games in the schedule.</div>
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
              <div className="display text-3xl leading-none text-foam">{Math.round(t.points)} <span className="text-sm text-shadow">pts</span></div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-shadow">
              <Stat n={t.games} label="games" />
              <Stat n={t.weekends} label="weekends" />
              <Stat n={t.premium} label="premium" />
            </div>
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-shadow">
          <span>Fairness meter</span>
          <span>{Math.abs(t1.points - t2.points) < 6 ? 'Dead even 🤝' : t1.points > t2.points ? `${p1.name} is up ${Math.round(t1.points - t2.points)}` : `${p2.name} is up ${Math.round(t2.points - t1.points)}`}</span>
        </div>
        <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-abyss/60">
          <motion.div className="h-full" animate={{ width: `${pct1}%` }} style={{ background: p1.color }} transition={{ type: 'spring', stiffness: 80, damping: 20 }} />
          <motion.div className="h-full flex-1" style={{ background: p2.color }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-shadow">
          <span>{p1.emoji} {pct1}%</span>
          <span>{played}/{games.length} games played</span>
          <span>{100 - pct1}% {p2.emoji}</span>
        </div>
      </section>

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

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl bg-abyss/40 py-2">
      <div className="display text-xl text-foam">{Number.isInteger(n) ? n : n.toFixed(1)}</div>
      <div>{label}</div>
    </div>
  )
}
