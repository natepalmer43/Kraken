import { useState } from 'react'
import { SEASON_LABEL } from '../data/schedule'
import { TEAMS } from '../data/teams'
import { useStore } from '../lib/store'
import { shareUrl } from '../lib/share'
import { SEATGEEK_AVAILABLE } from '../lib/seatgeek'
import { SYNC_AVAILABLE } from '../lib/supabase'
import type { Game, PersonId } from '../lib/types'
import { useToast } from './Toast'

const EMOJI = ['🐙', '🦑', '🦈', '🐋', '🐬', '🦀', '🐠', '⚓', '🏒', '🥅', '🧊', '🔱']
const COLORS = ['#99D9D9', '#E9072B', '#68A2B9', '#FFB81C', '#7CFC00', '#FF7AC6', '#C084FC', '#FF8C42']

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
      toast('Share link copied. Text it to your friend 📲')
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
    <div className="space-y-5">
      <Section title="The two of you">
        {state.people.map((p) => (
          <PersonEditor key={p.id} id={p.id} />
        ))}
      </Section>

      <Section title="Share with your friend">
        <p className="text-sm text-foam/80">
          No accounts, no passwords. Send a share link and your friend gets a copy of the board on their phone. Whoever changes something sends the next link.
        </p>
        <button onClick={copyShare} className="mt-3 w-full rounded-full bg-ice px-4 py-3 font-extrabold text-deep shadow-glow active:scale-[0.98]">
          🔗 Copy share link
        </button>
        <div className="mt-4 rounded-2xl border border-ice/10 bg-abyss/40 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest text-shadow">Live sync</div>
            <SyncDot status={syncStatus} />
          </div>
          {SYNC_AVAILABLE ? (
            <>
              <p className="mt-1 text-xs text-foam/70">Pick any secret room code. Both of you enter the same one and every change shows up on both phones instantly.</p>
              <div className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-ice/20 bg-abyss/50 px-3 py-2 text-sm outline-none focus:border-ice/60"
                  placeholder="e.g. buoy-2026"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.trim().toLowerCase())}
                />
                <button
                  onClick={() => {
                    dispatch({ type: 'setRoom', room: roomInput || null })
                    toast(roomInput ? `Joined room “${roomInput}”` : 'Left room')
                  }}
                  className="rounded-xl bg-ice/20 px-3 text-sm font-semibold text-ice"
                >
                  {state.room ? 'Update' : 'Join'}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-xs text-foam/60">
              Real-time sync is off. Add Supabase keys to <code className="text-ice">.env</code> (see README) and both phones will update live.
            </p>
          )}
        </div>
      </Section>

      <Section title="Schedule">
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="text-foam">{state.games.filter((g) => g.gameType === 2 && !state.overrides[g.id]?.hidden).length} regular-season home games</div>
            <div className="text-xs text-shadow">
              Source: {state.scheduleSource === 'nhl' ? `NHL API · ${new Date(state.scheduleFetchedAt!).toLocaleString()}` : 'built-in list'}
            </div>
          </div>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              const r = await refreshSchedule()
              setBusy(false)
              toast(r === 'ok' ? 'Schedule updated from NHL.com' : 'Could not reach the NHL API right now', r === 'ok' ? 'ok' : 'warn')
            }}
            className="rounded-full bg-ice/20 px-3 py-1.5 text-xs font-semibold text-ice disabled:opacity-50"
          >
            {busy ? 'Refreshing…' : '↻ Refresh from NHL'}
          </button>
        </div>
        <details className="mt-3 rounded-xl bg-abyss/40 p-3 text-sm">
          <summary className="cursor-pointer text-xs uppercase tracking-widest text-shadow">Add a game manually</summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input type="date" className="rounded-lg border border-ice/20 bg-abyss/50 px-2 py-1.5 text-sm" value={newGame.date} onChange={(e) => setNewGame({ ...newGame, date: e.target.value })} />
            <input type="time" className="rounded-lg border border-ice/20 bg-abyss/50 px-2 py-1.5 text-sm" value={newGame.time} onChange={(e) => setNewGame({ ...newGame, time: e.target.value })} />
            <select className="rounded-lg border border-ice/20 bg-abyss/50 px-2 py-1.5 text-sm" value={newGame.opponent} onChange={(e) => setNewGame({ ...newGame, opponent: e.target.value })}>
              {Object.values(TEAMS).filter((t) => t.abbrev !== 'SEA').map((t) => (
                <option key={t.abbrev} value={t.abbrev}>{t.city} {t.name}</option>
              ))}
            </select>
            <input placeholder="Theme night (optional)" className="rounded-lg border border-ice/20 bg-abyss/50 px-2 py-1.5 text-sm" value={newGame.promo} onChange={(e) => setNewGame({ ...newGame, promo: e.target.value })} />
            <button onClick={addGame} className="col-span-2 rounded-lg bg-ice/20 py-2 text-sm font-semibold text-ice">Add game</button>
          </div>
        </details>
        {hidden.length > 0 && (
          <div className="mt-3 text-xs text-shadow">
            {hidden.length} hidden game{hidden.length > 1 ? 's' : ''}.{' '}
            <button className="text-ice underline-offset-2 hover:underline" onClick={() => hidden.forEach((g) => dispatch({ type: 'override', gameId: g.id, patch: { hidden: false } }))}>
              Unhide all
            </button>
          </div>
        )}
      </Section>

      <Section title="Resale prices">
        {SEATGEEK_AVAILABLE ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="text-foam">{Object.keys(state.resale).length} games priced from SeatGeek</div>
              <div className="text-xs text-shadow">
                {resaleStatus === 'loading' ? 'Fetching…' : resaleStatus === 'failed' ? 'Last fetch failed' : newest(state.resale) ? `Updated ${newest(state.resale)}` : 'Not fetched yet'}
              </div>
            </div>
            <button
              disabled={resaleStatus === 'loading'}
              onClick={async () => {
                const r = await refreshResale()
                toast(r === 'ok' ? 'Resale prices updated' : 'Could not reach SeatGeek right now', r === 'ok' ? 'ok' : 'warn')
              }}
              className="shrink-0 rounded-full bg-ice/20 px-3 py-1.5 text-xs font-semibold text-ice disabled:opacity-50"
            >
              ↻ Refresh prices
            </button>
          </div>
        ) : (
          <p className="text-sm text-foam/80">
            Each game shows a resale value per ticket so you can decide whether to sell. Right now you enter it yourself (tap a game → Edit) after checking the SeatGeek, StubHub and Ticketmaster links.
            To pull live averages automatically, add a free SeatGeek client ID to <code className="text-ice">.env</code> (see README).
          </p>
        )}
      </Section>

      <Section title="Backup">
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJson} className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10">⬇ Export JSON</button>
          <label className="cursor-pointer rounded-full bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10">
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
            className="ml-auto rounded-full border border-alert/40 px-4 py-2 text-sm font-semibold text-alert hover:bg-alert/10"
          >
            Reset board
          </button>
        </div>
      </Section>

      <p className="pb-4 text-center text-xs text-shadow/70">Release the Tickets · {SEASON_LABEL} · Not affiliated with the Seattle Kraken or the NHL.</p>
    </div>
  )
}

function newest(resale: Record<string, { fetchedAt: string }>): string | null {
  const ts = Object.values(resale).map((q) => Date.parse(q.fetchedAt)).filter(Number.isFinite)
  return ts.length ? new Date(Math.max(...ts)).toLocaleString() : null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-4 sm:p-5">
      <h2 className="display mb-3 text-2xl text-ice">{title}</h2>
      {children}
    </section>
  )
}

function SyncDot({ status }: { status: 'off' | 'connecting' | 'live' | 'error' }) {
  const map = { off: ['bg-shadow/50', 'Off'], connecting: ['bg-amber-300 animate-pulse', 'Connecting'], live: ['bg-emerald-400', 'Live'], error: ['bg-alert', 'Error'] } as const
  const [cls, label] = map[status]
  return (
    <span className="flex items-center gap-1.5 text-xs text-shadow">
      <span className={`h-2 w-2 rounded-full ${cls}`} /> {label}
    </span>
  )
}

function PersonEditor({ id }: { id: PersonId }) {
  const { state, dispatch } = useStore()
  const p = state.people.find((x) => x.id === id)!
  return (
    <div className="mb-3 rounded-2xl border bg-abyss/30 p-3 last:mb-0" style={{ borderColor: `${p.color}44` }}>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full text-2xl" style={{ background: `${p.color}33` }}>{p.emoji}</span>
        <input
          className="display flex-1 rounded-xl border border-ice/20 bg-abyss/50 px-3 py-1.5 text-2xl outline-none focus:border-ice/60"
          value={p.name}
          maxLength={18}
          onChange={(e) => dispatch({ type: 'setPerson', id, patch: { name: e.target.value } })}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {EMOJI.map((e) => (
          <button key={e} onClick={() => dispatch({ type: 'setPerson', id, patch: { emoji: e } })} className={`rounded-lg px-1.5 py-0.5 text-lg ${p.emoji === e ? 'bg-ice/30' : 'hover:bg-white/10'}`}>{e}</button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {COLORS.map((c) => (
          <button key={c} onClick={() => dispatch({ type: 'setPerson', id, patch: { color: c } })} className={`h-6 w-6 rounded-full ${p.color === c ? 'ring-2 ring-foam ring-offset-2 ring-offset-deep' : ''}`} style={{ background: c }} aria-label={c} />
        ))}
      </div>
    </div>
  )
}
