import { useState } from 'react'
import { teamInfo } from '../data/teams'
import { burst } from '../lib/confetti'
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
  const [p1, p2] = state.people

  const choose = (owner: Owner | null, e?: React.MouseEvent) => {
    dispatch({ type: 'assign', gameId: game.id, owner })
    if (owner === 'p1' || owner === 'p2') {
      const p = state.people.find((x) => x.id === owner)!
      const rect = (e?.currentTarget as HTMLElement | undefined)?.getBoundingClientRect()
      burst(rect ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight } : undefined)
      toast(`${p.name} → ${t.name} ${fmtDate(game.date, { month: 'short', day: 'numeric' })}`)
    }
  }

  const btn = (active: boolean) => `btn90 sm w-full ${active ? 'outline outline-4 outline-yellow' : ''}`

  return (
    <Sheet open onClose={onClose}>
      <div className="flex items-center gap-4 pr-8">
        <OpponentBadge abbrev={game.opponent} size={78} />
        <div className="min-w-0">
          <div className="display text-3xl leading-none">{t.city} {t.name}</div>
          <div className="text-sm font-semibold text-steel">{fmtDate(game.date, { weekday: 'long', month: 'long', day: 'numeric' })} · {fmtTime(game.time)}</div>
          <div className="mt-1.5"><DayChip game={game} /></div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={(e) => choose('p1', e)} className={btn(a?.owner === 'p1')} style={{ background: p1.color, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>{p1.emoji} {p1.name}</button>
        <button onClick={(e) => choose('p2', e)} className={btn(a?.owner === 'p2')} style={{ background: p2.color, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>{p2.emoji} {p2.name}</button>
        <button onClick={(e) => choose('both', e)} className={btn(a?.owner === 'both')} style={{ background: `linear-gradient(90deg, ${p1.color} 50%, ${p2.color} 50%)`, color: '#fff', textShadow: '1px 1px 0 #0a0a0a' }}>Both of us</button>
        <button onClick={(e) => choose('sell', e)} className={btn(a?.owner === 'sell')}>💸 Sell it</button>
        <button onClick={() => choose(null)} className="btn90 sm white col-span-2">Clear</button>
      </div>

      {a?.owner === 'sell' && (
        <div className="card90-flat mt-3 flex items-center gap-2 bg-yellow px-3 py-2">
          <span className="text-xs font-extrabold uppercase tracking-wider">Sold the pair for</span>
          <span className="font-bold">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            className="input90 w-24"
            placeholder={r.value ? String(r.value * 2) : '0'}
            value={a.soldFor ?? ''}
            onChange={(e) => dispatch({ type: 'soldFor', gameId: game.id, amount: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </div>
      )}

      <label className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-steel">Note</label>
      <input
        className="input90 mt-1 w-full"
        placeholder={a ? 'Bringing my brother, meeting at Queen Anne Beerhall…' : 'Assign the game first to add a note'}
        disabled={!a}
        value={a?.note ?? ''}
        onChange={(e) => dispatch({ type: 'note', gameId: game.id, note: e.target.value })}
      />

      <div className="jumbotron mt-5 p-3">
        <div className="flex items-center justify-between">
          <span className="pixel text-[9px] text-silver/80">RESALE MARKET</span>
          <button className="pixel text-[9px] text-amber underline underline-offset-4" onClick={() => setEditing((x) => !x)}>
            {editing ? 'DONE' : 'EDIT'}
          </button>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className={`led text-3xl sm:text-4xl ${r.value ? '' : 'dim'}`}>{r.value ? fmtMoney(r.value) : '$---'}</div>
            <div className="pixel mt-1 text-[8px] text-silver/70">
              {r.source === 'live' && 'AVG PER TICKET · SEATGEEK'}
              {r.source === 'manual' && 'PER TICKET · YOUR NUMBER'}
              {!r.source && 'NO PRICE YET'}
            </div>
          </div>
          {r.value && (
            <div className="text-right">
              <div className="led green text-lg">{fmtMoney(r.value * 2)}</div>
              <div className="pixel text-[8px] text-silver/70">THE PAIR</div>
            </div>
          )}
        </div>
        {r.quote && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Mini label="LOW" v={fmtMoney(r.quote.lowest)} />
            <Mini label="MEDIAN" v={fmtMoney(r.quote.median)} />
            <Mini label="LISTED" v={String(r.quote.listings)} />
          </div>
        )}
        {editing && (
          <div className="mt-3 grid gap-2 border-t border-silver/20 pt-3 text-ice">
            <div className="flex items-center gap-2">
              <span className="pixel w-28 text-[8px] text-silver/80">YOUR EST. $</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                className="input90 flex-1"
                placeholder="per ticket"
                value={ov.resale ?? ''}
                onChange={(e) => dispatch({ type: 'override', gameId: game.id, patch: { resale: e.target.value === '' ? undefined : Number(e.target.value) } })}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="pixel w-28 text-[8px] text-silver/80">THEME NIGHT</span>
              <input
                className="input90 flex-1"
                placeholder="Bobblehead night, Pride night…"
                value={ov.promo ?? game.promo ?? ''}
                onChange={(e) => dispatch({ type: 'override', gameId: game.id, patch: { promo: e.target.value } })}
              />
            </div>
            <button
              className="pixel mt-1 text-left text-[8px] text-red-400 underline underline-offset-4"
              onClick={() => {
                dispatch({ type: 'override', gameId: game.id, patch: { hidden: true } })
                onClose()
              }}
            >
              HIDE THIS GAME FROM THE BOARD
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn90 sm white no-underline">
            {l.label} ↗
          </a>
        ))}
      </div>
    </Sheet>
  )
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div className="border border-silver/20 bg-black/40 py-1.5">
      <div className="led text-sm">{v}</div>
      <div className="pixel mt-1 text-[7px] text-silver/70">{label}</div>
    </div>
  )
}
