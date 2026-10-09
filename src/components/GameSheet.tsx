import { useState } from 'react'
import { teamInfo } from '../data/teams'
import { krakenBurst } from '../lib/confetti'
import { useStore } from '../lib/store'
import type { Game, Owner } from '../lib/types'
import { fmtDate, fmtMoney, fmtTime, resaleFor, resaleLinks } from '../lib/value'
import { DayChip } from './GameCard'
import { OpponentBadge } from './OpponentBadge'
import { Sheet } from './Sheet'
import { useToast } from './Toast'

export function GameSheet({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  if (!game) return <Sheet open={false} onClose={onClose}>{null}</Sheet>
  const t = teamInfo(game.opponent)
  const a = state.assignments[game.id]
  const ov = state.overrides[game.id] ?? {}
  const r = resaleFor(game, state)
  const links = resaleLinks(game, state)

  const choose = (owner: Owner | null, e?: React.MouseEvent) => {
    dispatch({ type: 'assign', gameId: game.id, owner })
    if (owner === 'p1' || owner === 'p2') {
      const p = state.people.find((x) => x.id === owner)!
      const rect = (e?.currentTarget as HTMLElement | undefined)?.getBoundingClientRect()
      krakenBurst(rect ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight } : undefined)
      toast(`${p.emoji} ${p.name} is going to ${t.name} on ${fmtDate(game.date, { month: 'short', day: 'numeric' })}`)
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
        <div className="min-w-0">
          <div className="display text-3xl leading-none">{t.city} {t.name}</div>
          <div className="text-sm text-shadow">{fmtDate(game.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(game.time)}</div>
          <div className="mt-1"><DayChip game={game} /></div>
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

      {a?.owner === 'sell' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2">
          <span className="text-xs uppercase tracking-widest text-amber-100">Sold the pair for</span>
          <span className="text-amber-100">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            className="w-24 rounded-lg border border-amber-400/30 bg-abyss/50 px-2 py-1 text-sm text-amber-50 outline-none"
            placeholder={r.value ? String(r.value * 2) : '0'}
            value={a.soldFor ?? ''}
            onChange={(e) => dispatch({ type: 'soldFor', gameId: game.id, amount: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </div>
      )}

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
          <span className="text-xs uppercase tracking-widest text-shadow">Resale market</span>
          <button className="text-xs text-ice underline-offset-2 hover:underline" onClick={() => setEditing((x) => !x)}>
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className={`display text-4xl leading-none ${r.value ? 'text-ice' : 'text-shadow/50'}`}>{r.value ? fmtMoney(r.value) : '—'}</div>
            <div className="text-[11px] text-shadow">
              {r.source === 'live' && 'avg per ticket on SeatGeek'}
              {r.source === 'manual' && 'per ticket, entered by you'}
              {!r.source && 'no price yet'}
            </div>
          </div>
          {r.value && <div className="text-right text-sm text-foam/80">≈ {fmtMoney(r.value * 2)} <span className="text-xs text-shadow">for the pair</span></div>}
        </div>
        {r.quote && (
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
            <Mini label="Low" v={fmtMoney(r.quote.lowest)} />
            <Mini label="Median" v={fmtMoney(r.quote.median)} />
            <Mini label="Listings" v={String(r.quote.listings)} />
          </div>
        )}
        {editing && (
          <div className="mt-3 grid gap-2 border-t border-ice/10 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-28 text-xs text-shadow">Your resale est.</span>
              <span className="text-shadow">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                className="flex-1 rounded-lg border border-ice/20 bg-abyss/50 px-2 py-1 text-sm outline-none"
                placeholder="per ticket"
                value={ov.resale ?? ''}
                onChange={(e) => dispatch({ type: 'override', gameId: game.id, patch: { resale: e.target.value === '' ? undefined : Number(e.target.value) } })}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 text-xs text-shadow">Theme night</span>
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
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-foam/90 hover:bg-white/10">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-lg bg-abyss/50 py-1.5">
      <div className="text-foam">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-shadow">{label}</div>
    </div>
  )
}
