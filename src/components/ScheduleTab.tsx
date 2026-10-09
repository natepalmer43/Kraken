import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import type { Game } from '../lib/types'
import { isWeekend, monthKey, monthLabel, todayKey, visibleGames } from '../lib/value'
import { GameCard } from './GameCard'
import { GameSheet } from './GameSheet'

type Filter = 'upcoming' | 'all' | 'open' | 'weekend' | 'weeknight' | 'sell' | 'p1' | 'p2'

export function ScheduleTab() {
  const { state } = useStore()
  const [filter, setFilter] = useState<Filter>('upcoming')
  const [open, setOpen] = useState<Game | null>(null)
  const games = visibleGames(state)
  const today = todayKey()

  const filtered = useMemo(
    () =>
      games.filter((g) => {
        const o = state.assignments[g.id]?.owner
        switch (filter) {
          case 'open': return !o && g.date >= today
          case 'weekend': return isWeekend(g) && g.date >= today
          case 'weeknight': return !isWeekend(g) && g.date >= today
          case 'sell': return o === 'sell'
          case 'p1': case 'p2': return o === filter || o === 'both'
          case 'upcoming': return g.date >= today
          default: return true
        }
      }),
    [games, filter, state.assignments, today],
  )

  const groups = useMemo(() => {
    const m = new Map<string, Game[]>()
    for (const g of filtered) {
      const k = monthKey(g.date)
      m.set(k, [...(m.get(k) ?? []), g])
    }
    return [...m.entries()]
  }, [filtered])

  const openCount = games.filter((g) => !state.assignments[g.id] && g.date >= today).length
  const chips: Array<{ id: Filter; label: string }> = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'open', label: `Unassigned${openCount ? ` (${openCount})` : ''}` },
    { id: 'weekend', label: '🎉 Weekend' },
    { id: 'weeknight', label: 'Weeknight' },
    { id: 'sell', label: '💸 Selling' },
    { id: 'p1', label: `${state.people[0].emoji} ${state.people[0].name}` },
    { id: 'p2', label: `${state.people[1].emoji} ${state.people[1].name}` },
    { id: 'all', label: 'All' },
  ]

  return (
    <div>
      <div className="scroll-hide -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${filter === c.id ? 'bg-ice text-deep' : 'glass text-foam/80 hover:bg-white/10'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {state.scheduleSource === 'bundled' && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Showing the built-in schedule. Open Settings → “Refresh from NHL” once you're online to pull official dates and times.
        </div>
      )}

      {groups.length === 0 && <div className="glass rounded-2xl p-8 text-center text-shadow">Nothing here. Try another filter.</div>}

      <div className="space-y-6">
        {groups.map(([k, list]) => (
          <section key={k}>
            <h2 className="display sticky top-0 z-10 -mx-4 mb-2 bg-gradient-to-b from-deep via-deep/95 to-transparent px-4 pb-3 pt-2 text-2xl text-ice">
              {monthLabel(k)} <span className="text-base text-shadow">· {list.length} {list.length === 1 ? 'game' : 'games'}</span>
            </h2>
            <AnimatePresence initial={false}>
              <motion.div layout className="space-y-2">
                {list.map((g) => (
                  <GameCard key={g.id} game={g} onClick={() => setOpen(g)} />
                ))}
              </motion.div>
            </AnimatePresence>
          </section>
        ))}
      </div>
      <GameSheet game={open} onClose={() => setOpen(null)} />
    </div>
  )
}
