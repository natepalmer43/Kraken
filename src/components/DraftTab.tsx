import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { krakenBurst, releaseTheKraken } from '../lib/confetti'
import { pickerAt, useStore } from '../lib/store'
import type { Game, PersonId } from '../lib/types'
import { draftableGames, gameValue, tally } from '../lib/value'
import { GameCard } from './GameCard'
import { useToast } from './Toast'

export function DraftTab() {
  const { state, dispatch, autoPick } = useStore()
  const toast = useToast()
  const [sort, setSort] = useState<'value' | 'date'>('value')
  const games = useMemo(() => draftableGames(state), [state])
  const remaining = useMemo(() => {
    const list = games.filter((g) => !state.assignments[g.id])
    return sort === 'value' ? list.slice().sort((a, b) => gameValue(b, state).total - gameValue(a, state).total) : list
  }, [games, state, sort])
  const [p1, p2] = state.people
  const d = state.draft
  const onClock: PersonId | null = d.status === 'live' && d.first ? pickerAt(d.picks.length, d.first) : null
  const clockPerson = onClock ? state.people.find((p) => p.id === onClock)! : null
  const t1 = tally(state, 'p1')
  const t2 = tally(state, 'p2')

  useEffect(() => {
    if (d.status === 'done' && d.picks.length) releaseTheKraken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.status])

  const pick = (g: Game) => {
    if (!clockPerson) return
    dispatch({ type: 'draftPick', gameId: g.id })
    krakenBurst()
    toast(`${clockPerson.emoji} ${clockPerson.name} takes ${g.opponent} (+${gameValue(g, state).total})`)
  }

  if (d.status === 'idle') {
    return (
      <div className="space-y-4">
        <section className="glass rounded-3xl p-6 text-center">
          <div className="text-6xl">🪙</div>
          <h2 className="display mt-2 text-4xl text-ice">Snake Draft</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-foam/80">
            Flip a coin for first pick, then alternate in snake order (A·B·B·A). Every game has a point value so the split ends up fair, not just even.
          </p>
          <div className="mt-4 text-sm text-shadow">
            {remaining.length} upcoming games open · {Math.round(remaining.reduce((s, g) => s + gameValue(g, state).total, 0))} total points on the board
          </div>
          <button
            onClick={() => dispatch({ type: 'draftStart' })}
            disabled={remaining.length === 0}
            className="mt-5 rounded-full bg-ice px-6 py-3 text-base font-extrabold text-deep shadow-glow transition hover:brightness-110 active:scale-95 disabled:opacity-40"
          >
            Flip for first pick
          </button>
          {remaining.length === 0 && <p className="mt-3 text-xs text-shadow">Every game is already claimed. Clear assignments in Settings to redraft.</p>}
        </section>
      </div>
    )
  }

  if (d.status === 'flipping') {
    return <CoinFlip onDone={(first) => dispatch({ type: 'draftFlip', first })} />
  }

  if (d.status === 'done') {
    const lead = t1.points === t2.points ? null : t1.points > t2.points ? p1 : p2
    return (
      <div className="space-y-4">
        <section className="glass rounded-3xl p-6 text-center">
          <div className="text-6xl">🏒</div>
          <h2 className="display mt-2 text-4xl text-ice">Draft complete</h2>
          <p className="mt-1 text-sm text-foam/80">
            {lead ? `${lead.emoji} ${lead.name} edges it by ${Math.abs(Math.round(t1.points - t2.points))} pts. Settle it with a trade in the Ledger.` : 'Perfectly balanced, as all things should be.'}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[{ p: p1, t: t1 }, { p: p2, t: t2 }].map(({ p, t }) => (
              <div key={p.id} className="rounded-2xl bg-abyss/40 p-3">
                <div className="display text-2xl" style={{ color: p.color }}>{p.emoji} {p.name}</div>
                <div className="display text-4xl">{Math.round(t.points)}</div>
                <div className="text-xs text-shadow">{t.games} games · {t.weekends} weekends</div>
              </div>
            ))}
          </div>
          <button onClick={() => dispatch({ type: 'draftReset' })} className="mt-5 text-sm text-shadow underline-offset-2 hover:text-ice hover:underline">
            Dismiss
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.section
          key={onClock ?? 'x'}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="glass sticky top-2 z-20 rounded-3xl p-4"
          style={{ borderColor: `${clockPerson?.color}66` }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full text-3xl animate-pulse-ring" style={{ background: `${clockPerson?.color}33` }}>
              {clockPerson?.emoji}
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.25em] text-shadow">On the clock · pick {d.picks.length + 1}</div>
              <div className="display text-3xl leading-none" style={{ color: clockPerson?.color }}>{clockPerson?.name}</div>
            </div>
            <div className="text-right text-xs text-shadow">
              <div style={{ color: p1.color }}>{p1.emoji} {Math.round(t1.points)}</div>
              <div style={{ color: p2.color }}>{p2.emoji} {Math.round(t2.points)}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={autoPick} className="rounded-full bg-ice/20 px-3 py-1.5 text-xs font-semibold text-ice hover:bg-ice/30">✨ Auto-pick best</button>
            <button onClick={() => dispatch({ type: 'draftUndo' })} disabled={!d.picks.length} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-foam/80 hover:bg-white/10 disabled:opacity-30">↶ Undo</button>
            <button onClick={() => setSort((s) => (s === 'value' ? 'date' : 'value'))} className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-foam/80 hover:bg-white/10">
              Sort: {sort === 'value' ? 'by value' : 'by date'}
            </button>
            <button onClick={() => dispatch({ type: 'draftEnd' })} className="ml-auto rounded-full px-3 py-1.5 text-xs text-shadow hover:text-alert">End draft</button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-abyss/60">
            <motion.div className="h-full bg-ice" animate={{ width: `${(d.picks.length / Math.max(1, d.picks.length + remaining.length)) * 100}%` }} />
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="space-y-2">
        {remaining.map((g) => (
          <GameCard key={g.id} game={g} compact onClick={() => pick(g)} />
        ))}
      </div>
    </div>
  )
}

function CoinFlip({ onDone }: { onDone: (first: PersonId) => void }) {
  const { state } = useStore()
  const [p1, p2] = state.people
  const [result, setResult] = useState<PersonId | null>(null)
  const [spinning, setSpinning] = useState(false)
  const flip = () => {
    if (spinning) return
    setSpinning(true)
    const winner: PersonId = Math.random() < 0.5 ? 'p1' : 'p2'
    setTimeout(() => {
      setResult(winner)
      setSpinning(false)
      krakenBurst({ x: 0.5, y: 0.4 })
    }, 1800)
  }
  const winner = result ? state.people.find((p) => p.id === result)! : null
  const turns = 6 * 360 + (result === 'p2' ? 180 : 0)
  return (
    <section className="glass rounded-3xl p-6 text-center">
      <h2 className="display text-4xl text-ice">Who picks first?</h2>
      <p className="text-sm text-shadow">Heads is {p1.emoji} {p1.name}, tails is {p2.emoji} {p2.name}.</p>
      <div className="mx-auto my-8 h-40 w-40" style={{ perspective: 900 }}>
        <motion.div
          className="coin relative h-full w-full"
          animate={{ rotateY: spinning ? turns : result === 'p2' ? 180 : 0, y: spinning ? [0, -90, 0] : 0 }}
          transition={{ rotateY: { duration: 1.8, ease: [0.2, 0.8, 0.2, 1] }, y: { duration: 1.8, ease: 'easeInOut' } }}
        >
          <div className="coin-face text-6xl shadow-glow" style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${p1.color} 60%, #355464)` }}>{p1.emoji}</div>
          <div className="coin-face coin-back text-6xl shadow-glow" style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${p2.color} 60%, #355464)` }}>{p2.emoji}</div>
        </motion.div>
      </div>
      {!winner ? (
        <button onClick={flip} disabled={spinning} className="rounded-full bg-ice px-6 py-3 font-extrabold text-deep shadow-glow active:scale-95 disabled:opacity-60">
          {spinning ? 'Flipping…' : 'Flip it'}
        </button>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="display text-3xl" style={{ color: winner.color }}>{winner.emoji} {winner.name} picks first!</div>
          <button onClick={() => onDone(winner.id)} className="mt-4 rounded-full bg-ice px-6 py-3 font-extrabold text-deep shadow-glow active:scale-95">
            Start the draft
          </button>
        </motion.div>
      )}
    </section>
  )
}
