import { useState } from 'react'
import { teamInfo } from '../data/teams'
import { krakenBurst } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game, Owner } from '../lib/types'
import { fmtDate, fmtTime, gameValue } from '../lib/value'
import { OpponentBadge } from './OpponentBadge'
import { Sheet } from './Sheet'
import { useToast } from './Toast'

export function GameSheet({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  if (!game) return <Sheet open={false} onClose={onClose}>{null}</Sheet>
  const v = gameValue(game, state)
  const t = teamInfo(game.opponent)
  const a = state.assignments[game.id]
  const ov = state.overrides[game.id] ?? {}

  const choose = (owner: Owner | null, e?: React.MouseEvent) => {
    dispatch({ type: 'assign', gameId: game.id, owner })
    if (owner === 'p1' || owner === 'p2') {
      const p = state.people.find((x) => x.id === owner)!
      const r = (e?.currentTarget as HTMLElement | undefined)?.getBoundingClientRect()
      krakenBurst(r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : undefined)
      toast(`${p.emoji} ${p.name} claims ${t.name} on ${fmtDate(game.date, { month: 'short', day: 'numeric' })}`)
    }
  }

  const options: Array<{ owner: Owner | null; label: string; style: React.CSSProperties }> = [
    { owner: 'p1', label: `${state.people[0].emoji} ${state.people[0].name}`, style: { background: `${state.people[0].color}2a`, color: state.people[0].color, borderColor: `${state.people[0].color}66` } },
    { owner: 'p2', label: `${state.people[1].emoji} ${state.people[1].name}`, style: { background: `${state.people[1].color}2a`, color: state.people[1].color, borderColor: `${state.people[1].color}66` } },
    { owner: 'both', label: 'Both of us', style: { background: 'linear-gradient(90deg, rgba(153,217,217,.2), rgba(233,7,43,.2))', borderColor: 'rgba(153,217,217,.4)' } },
    { owner: 'sell', label: '💸 Sell it', style: { background: 'rgba(251,191,36,.15)', color: '#fde68a', borderColor: 'rgba(251,191,36,.4)' } },
    { owner: null, label: 'Clear', style: { background: 'transparent', borderColor: 'rgba(153,217,217,.2)', color: '#68a2b9' } },
  ]

  return (
    <Sheet open onClose={onClose}>
      <div className="flex items-center gap-4">
        <OpponentBadge abbrev={game.opponent} size={64} />
        <div>
          <div className="display text-3xl leading-none">{t.city} {t.name}</div>
          <div className="text-sm text-shadow">{fmtDate(game.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(game.time)}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={String(o.owner)}
            onClick={(e) => choose(o.owner, e)}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition active:scale-95 ${a?.owner === o.owner ? 'ring-2 ring-foam/70' : ''} ${o.owner === null ? 'col-span-2' : ''}`}
            style={o.style}
          >
            {o.label}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-xs uppercase tracking-widest text-shadow">Note</label>
      <input
        className="mt-1 w-full rounded-xl border border-ice/20 bg-abyss/50 px-3 py-2 text-sm outline-none focus:border-ice/60"
        placeholder={a ? 'Bringing my brother, meeting at Queen Anne Beerhall…' : 'Assign the game first to add a note'}
        disabled={!a}
        value={a?.note ?? ''}
        onChange={(e) => dispatch({ type: 'note', gameId: game.id, note: e.target.value })}
      />

      <div className="mt-5 rounded-2xl border border-ice/10 bg-abyss/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-shadow">Why it's worth {v.total} pts</span>
          <button className="text-xs text-ice underline-offset-2 hover:underline" onClick={() => setEditing((x) => !x)}>
            {editing ? 'Done' : 'Adjust'}
          </button>
        </div>
        <ul className="mt-2 space-y-1 text-sm">
          {v.parts.map((p, i) => (
            <li key={i} className="flex justify-between">
              <span className="text-foam/80">{p.label}</span>
              <span className={`tabular-nums ${p.pts < 0 ? 'text-alert' : 'text-ice'}`}>{p.pts > 0 ? '+' : ''}{p.pts}</span>
            </li>
          ))}
        </ul>
        {editing && (
          <div className="mt-3 grid gap-2 border-t border-ice/10 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-shadow">Bonus pts</span>
              <button className="rounded-lg bg-boundless/60 px-3 py-1" onClick={() => dispatch({ type: 'override', gameId: game.id, patch: { bonus: (ov.bonus ?? 0) - 1 } })}>−</button>
              <span className="w-8 text-center tabular-nums">{ov.bonus ?? 0}</span>
              <button className="rounded-lg bg-boundless/60 px-3 py-1" onClick={() => dispatch({ type: 'override', gameId: game.id, patch: { bonus: (ov.bonus ?? 0) + 1 } })}>+</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 text-xs text-shadow">Theme night</span>
              <input
                className="flex-1 rounded-lg border border-ice/20 bg-abyss/50 px-2 py-1 text-sm outline-none"
                placeholder="Bobblehead night, Pride night…"
                value={ov.promo ?? game.promo ?? ''}
                onChange={(e) => dispatch({ type: 'override', gameId: game.id, patch: { promo: e.target.value } })}
              />
            </div>
            <button
              className="mt-1 text-left text-xs text-alert/80 hover:text-alert"
              onClick={() => {
                dispatch({ type: 'override', gameId: game.id, patch: { hidden: true } })
                onClose()
              }}
            >
              Hide this game from the board
            </button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
