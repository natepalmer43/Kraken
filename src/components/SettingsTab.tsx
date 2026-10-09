import { useState } from 'react'
import { SEASON_LABEL } from '../data/schedule'
import { TEAMS } from '../data/teams'
import { useStore } from '../lib/store'
import { SEATGEEK_AVAILABLE } from '../lib/seatgeek'
import { shareUrl } from '../lib/share'
import { SYNC_AVAILABLE } from '../lib/supabase'
import type { Game, PersonId } from '../lib/types'
import { SectionHead } from './HomeTab'
import { useToast } from './Toast'

const EMOJI = ['🐙', '🦑', '🦈', '🐋', '🐬', '🦀', '🐠', '⚓', '🏒', '🥅', '🧊', '🔱']
const COLORS = ['#1FB5A8', '#D7263D', '#0B1F3A', '#5B2A86', '#F26419', '#2A9D3B', '#FF4FA3', '#B8860B']

export function SettingsTab() {
  const { state, dispatch, refreshSchedule, refreshResale, syncStatus, resaleStatus } = useStore()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [roomInput, setRoomInput] = useState(state.room ?? '')
  const [newGame, setNewGame] = useState<{ date: string; time: string; opponent: string; promo: string }>({ date: '', time: '19:00', opponent: 'VAN', promo: '' })
  const hidden = state.games.filter((g) => state.overrides[g.id]?.hidden)

  const copyShare = async () => {
    const url = shareUrl(state)
    try {
      await navigator.clipboard.writeText(url)
      toast('Share link copied. Text it to your friend.')
    } catch {
      prompt('Copy this link', url)
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `kraken-tickets-${SEASON_LABEL}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = (file: File) => {
    file.text().then((txt) => {
      try {
        const parsed = JSON.parse(txt)
        if (parsed.version !== 1) throw new Error()
        dispatch({ type: 'replace', state: parsed, keepRoom: true })
        toast('Board imported')
      } catch {
        toast('That file is not a valid board export', 'warn')
      }
    })
  }

  const addGame = () => {
    if (!newGame.date) return
    const g: Game = {
      id: `m-${newGame.date}-${newGame.opponent}-${Date.now()}`,
      date: newGame.date,
      time: newGame.time || null,
      opponent: newGame.opponent,
      promo: newGame.promo || null,
      gameType: 2,
      source: 'manual',
    }
    dispatch({ type: 'addGame', game: g })
    toast('Game added')
    setNewGame({ ...newGame, date: '', promo: '' })
  }

  return (
    <div className="space-y-7">
      <section>
        <SectionHead title="Roster" sub="The two of you" />
        <div className="grid gap-4 sm:grid-cols-2">
          {state.people.map((p) => (
            <PersonEditor key={p.id} id={p.id} />
          ))}
        </div>
      </section>

      <section>
        <SectionHead title="Share" sub="With your friend" />
        <div className="card90 p-4">
          <p className="text-sm font-semibold">
            No accounts, no passwords. Send a share link and your friend gets a copy of the board on their phone. Whoever changes something sends the next link.
          </p>
          <button onClick={copyShare} className="btn90 mt-3 w-full">🔗 Copy share link</button>
          <div className="jumbotron mt-4 p-3">
            <div className="flex items-center justify-between">
              <div className="pixel text-[9px] text-silver/80">LIVE SYNC</div>
              <SyncDot status={syncStatus} />
            </div>
            {SYNC_AVAILABLE ? (
              <>
                <p className="pixel mt-2 text-[8px] leading-relaxed text-silver/80">PICK A SECRET ROOM CODE. BOTH OF YOU ENTER THE SAME ONE.</p>
                <div className="mt-2 flex gap-2">
                  <input className="input90 flex-1" placeholder="e.g. buoy-2026" value={roomInput} onChange={(e) => setRoomInput(e.target.value.trim().toLowerCase())} />
                  <button
                    onClick={() => {
                      dispatch({ type: 'setRoom', room: roomInput || null })
                      toast(roomInput ? `Joined room “${roomInput}”` : 'Left room')
                    }}
                    className="btn90 sm"
                  >
                    {state.room ? 'Update' : 'Join'}
                  </button>
                </div>
              </>
            ) : (
              <p className="pixel mt-2 text-[8px] leading-relaxed text-silver/80">OFF. ADD SUPABASE KEYS (SEE README) AND BOTH PHONES UPDATE LIVE.</p>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionHead title="Your plan" sub="The games on your tickets" />
        <div className="card90 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="font-extrabold">{state.games.filter((g) => !state.overrides[g.id]?.hidden).length} games in your plan</div>
              <div className="text-xs font-semibold text-steel">
                {state.scheduleSource === 'nhl' ? `Start times verified with NHL.com · ${new Date(state.scheduleFetchedAt!).toLocaleString()}` : 'Dates and times from your Ticketmaster account'}
              </div>
            </div>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                const r = await refreshSchedule()
                setBusy(false)
                toast(r === 'ok' ? 'Start times verified with NHL.com' : 'Could not reach the NHL API right now', r === 'ok' ? 'ok' : 'warn')
              }}
              className="btn90 sm shrink-0"
            >
              {busy ? 'Checking…' : '↻ Verify times'}
            </button>
          </div>
          <details className="card90-flat mt-3 p-3 text-sm">
            <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-wider">Add a game (bought extra tickets?)</summary>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="date" className="input90" value={newGame.date} onChange={(e) => setNewGame({ ...newGame, date: e.target.value })} />
              <input type="time" className="input90" value={newGame.time} onChange={(e) => setNewGame({ ...newGame, time: e.target.value })} />
              <select className="input90" value={newGame.opponent} onChange={(e) => setNewGame({ ...newGame, opponent: e.target.value })}>
                {Object.values(TEAMS).filter((t) => t.abbrev !== 'SEA').map((t) => (
                  <option key={t.abbrev} value={t.abbrev}>{t.city} {t.name}</option>
                ))}
              </select>
              <input placeholder="Theme night (optional)" className="input90" value={newGame.promo} onChange={(e) => setNewGame({ ...newGame, promo: e.target.value })} />
              <button onClick={addGame} className="btn90 sm col-span-2">Add game</button>
            </div>
          </details>
          {hidden.length > 0 && (
            <div className="mt-3 text-xs font-semibold text-steel">
              {hidden.length} game{hidden.length > 1 ? 's' : ''} removed from the board.{' '}
              <button className="font-extrabold text-navy underline underline-offset-2" onClick={() => hidden.forEach((g) => dispatch({ type: 'override', gameId: g.id, patch: { hidden: false } }))}>
                Restore
              </button>
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHead title="Resale prices" />
        <div className="card90 p-4">
          {SEATGEEK_AVAILABLE ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <div className="font-extrabold">{Object.keys(state.resale).length} games priced from SeatGeek</div>
                <div className="text-xs font-semibold text-steel">
                  {resaleStatus === 'loading' ? 'Fetching…' : resaleStatus === 'failed' ? 'Last fetch failed' : newest(state.resale) ? `Updated ${newest(state.resale)}` : 'Not fetched yet'}
                </div>
              </div>
              <button
                disabled={resaleStatus === 'loading'}
                onClick={async () => {
                  const r = await refreshResale()
                  toast(r === 'ok' ? 'Resale prices updated' : 'Could not reach SeatGeek right now', r === 'ok' ? 'ok' : 'warn')
                }}
                className="btn90 sm shrink-0"
              >
                ↻ Refresh prices
              </button>
            </div>
          ) : (
            <p className="text-sm font-semibold">
              Each game shows a resale value per ticket so you can decide whether to sell. Right now you enter it yourself (tap a game → Edit) after checking the SeatGeek, StubHub and Ticketmaster links.
              To pull live averages automatically, add a free SeatGeek client ID (see README).
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHead title="Backup" />
        <div className="card90 flex flex-wrap gap-3 p-4">
          <button onClick={exportJson} className="btn90 sm white">⬇ Export JSON</button>
          <label className="btn90 sm white">
            ⬆ Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </label>
          <button
            onClick={() => {
              if (confirm('Clear every assignment and swap? Your names, schedule and prices stay.')) {
                dispatch({ type: 'clearAssignments' })
                toast('Board cleared')
              }
            }}
            className="btn90 sm red ml-auto"
          >
            Reset board
          </button>
        </div>
      </section>

      <p className="pb-4 text-center text-xs font-semibold text-steel">Release the Tickets · {SEASON_LABEL} · Not affiliated with the Seattle Kraken or the NHL.</p>
    </div>
  )
}

function newest(resale: Record<string, { fetchedAt: string }>): string | null {
  const ts = Object.values(resale).map((q) => Date.parse(q.fetchedAt)).filter(Number.isFinite)
  return ts.length ? new Date(Math.max(...ts)).toLocaleString() : null
}

function SyncDot({ status }: { status: 'off' | 'connecting' | 'live' | 'error' }) {
  const map = { off: ['dim', 'OFF'], connecting: ['blink', 'CONNECTING'], live: ['green', 'LIVE'], error: ['red', 'ERROR'] } as const
  const [cls, label] = map[status]
  return <span className={`led pixel text-[9px] ${cls}`}>● {label}</span>
}

function PersonEditor({ id }: { id: PersonId }) {
  const { state, dispatch } = useStore()
  const p = state.people.find((x) => x.id === id)!
  return (
    <div className="card90 overflow-hidden">
      <div className="flex items-center gap-3 border-b-[3px] border-ink px-3 py-2" style={{ background: p.color }}>
        <span className="grid h-10 w-10 place-items-center border-2 border-ink bg-white text-2xl">{p.emoji}</span>
        <input
          className="display w-full border-2 border-ink bg-white px-2 py-1 text-2xl outline-none focus:ring-4 focus:ring-yellow"
          value={p.name}
          maxLength={18}
          onChange={(e) => dispatch({ type: 'setPerson', id, patch: { name: e.target.value } })}
        />
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1">
          {EMOJI.map((e) => (
            <button key={e} onClick={() => dispatch({ type: 'setPerson', id, patch: { emoji: e } })} className={`grid h-9 w-9 place-items-center border-2 text-lg ${p.emoji === e ? 'border-ink bg-yellow' : 'border-transparent hover:border-ink'}`}>{e}</button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button key={c} onClick={() => dispatch({ type: 'setPerson', id, patch: { color: c } })} className={`h-7 w-7 border-2 border-ink ${p.color === c ? 'outline outline-3 outline-yellow' : ''}`} style={{ background: c }} aria-label={c} />
          ))}
        </div>
      </div>
    </div>
  )
}
