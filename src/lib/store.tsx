import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { PLAN_DEFAULT_ASSIGNMENTS, PLAN_VERSION, TICKET_PLAN } from '../data/schedule'
import { fetchKrakenHomeSchedule, remapByGame } from './nhl'
import { SEATGEEK_AVAILABLE, fetchResaleQuotes } from './seatgeek'
import { SYNC_AVAILABLE, loadBoard, saveBoard, subscribeBoard } from './supabase'
import type { AppState, Game, GameOverride, Owner, PersonId, ResaleQuote } from './types'

const STORAGE_KEY = 'release-the-tickets:v1'

export function initialState(): AppState {
  return {
    version: 1,
    people: [
      { id: 'p1', name: 'Nate', emoji: '🐙', color: '#1FB5A8' },
      { id: 'p2', name: 'Jarreau', emoji: '🦑', color: '#D7263D' },
    ],
    games: TICKET_PLAN,
    planVersion: PLAN_VERSION,
    scheduleSource: 'bundled',
    scheduleFetchedAt: null,
    assignments: { ...PLAN_DEFAULT_ASSIGNMENTS },
    overrides: {},
    resale: {},
    trades: [],
    updatedAt: new Date(0).toISOString(),
  }
}

export type Action =
  | { type: 'replace'; state: AppState }
  | { type: 'setPerson'; id: PersonId; patch: Partial<Omit<AppState['people'][0], 'id'>> }
  | { type: 'assign'; gameId: string; owner: Owner | null }
  | { type: 'note'; gameId: string; note: string }
  | { type: 'soldFor'; gameId: string; amount: number | null }
  | { type: 'override'; gameId: string; patch: GameOverride }
  | { type: 'addGame'; game: Game }
  | { type: 'setSchedule'; games: Game[] }
  | { type: 'setResale'; quotes: Record<string, ResaleQuote> }
  | { type: 'trade'; from: PersonId; gave: string; got: string | null }
  | { type: 'clearAssignments' }

function stamp(s: AppState): AppState {
  return { ...s, updatedAt: new Date().toISOString() }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replace':
      return migratePlan({ ...initialState(), ...action.state })
    case 'setPerson':
      return stamp({
        ...state,
        people: state.people.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) as AppState['people'],
      })
    case 'assign': {
      const assignments = { ...state.assignments }
      if (action.owner === null) delete assignments[action.gameId]
      else assignments[action.gameId] = { ...assignments[action.gameId], owner: action.owner }
      return stamp({ ...state, assignments })
    }
    case 'note': {
      const existing = state.assignments[action.gameId]
      if (!existing) return state
      return stamp({ ...state, assignments: { ...state.assignments, [action.gameId]: { ...existing, note: action.note } } })
    }
    case 'soldFor': {
      const existing = state.assignments[action.gameId]
      if (!existing) return state
      const next = { ...existing }
      if (action.amount === null) delete next.soldFor
      else next.soldFor = action.amount
      return stamp({ ...state, assignments: { ...state.assignments, [action.gameId]: next } })
    }
    case 'override':
      return stamp({
        ...state,
        overrides: { ...state.overrides, [action.gameId]: { ...state.overrides[action.gameId], ...action.patch } },
      })
    case 'addGame':
      return stamp({ ...state, games: [...state.games, action.game] })
    case 'setSchedule': {
      // The NHL feed covers every home game; we only own some. Update start
      // times for games we hold (matched by date + opponent) and never add any.
      const byKey = new Map(action.games.map((g) => [`${g.date}|${g.opponent}`, g]))
      const games = state.games.map((g) => {
        const live = byKey.get(`${g.date}|${g.opponent}`)
        return live && live.time && live.time !== g.time ? { ...g, time: live.time } : g
      })
      return { ...state, games, scheduleSource: 'nhl', scheduleFetchedAt: new Date().toISOString() }
    }
    case 'setResale':
      // Resale quotes are market data, not a decision: don't bump updatedAt so they never win a sync conflict.
      return { ...state, resale: { ...state.resale, ...action.quotes } }
    case 'trade': {
      const to: PersonId = action.from === 'p1' ? 'p2' : 'p1'
      const assignments = { ...state.assignments }
      assignments[action.gave] = { ...assignments[action.gave], owner: to }
      if (action.got) assignments[action.got] = { ...assignments[action.got], owner: action.from }
      return stamp({
        ...state,
        assignments,
        trades: [
          { id: `${Date.now()}`, at: new Date().toISOString(), from: action.from, to, gave: action.gave, got: action.got },
          ...state.trades,
        ],
      })
    }
    case 'clearAssignments':
      return stamp({ ...state, assignments: {}, trades: [] })
    default:
      return state
  }
}

function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<AppState> & { draft?: unknown; room?: unknown }
    if (parsed.version !== 1) return initialState()
    delete parsed.draft
    delete parsed.room
    const merged = { ...initialState(), ...(parsed as AppState) }
    // Colors from the first (dark) design don't read on cream; map them to the current palette.
    const legacy: Record<string, string> = { '#99D9D9': '#1FB5A8', '#E9072B': '#D7263D', '#68A2B9': '#0B1F3A', '#FFB81C': '#B8860B', '#7CFC00': '#2A9D3B', '#FF7AC6': '#FF4FA3', '#C084FC': '#5B2A86', '#FF8C42': '#F26419' }
    merged.people = merged.people.map((p) => ({
      ...p,
      color: legacy[p.color] ?? p.color,
      name: p.id === 'p2' && (p.name === 'Friend' || p.name === 'Ian' || p.name === 'Jerreau') ? 'Jarreau' : p.name,
    })) as AppState['people']
    return migratePlan(merged)
  } catch {
    return initialState()
  }
}

/** Swap in the current ticket plan, carrying assignments across by date + opponent. */
function migratePlan(s: AppState): AppState {
  if (s.planVersion === PLAN_VERSION) return s
  const manual = s.games.filter((g) => g.source === 'manual')
  const games = [...TICKET_PLAN, ...manual]
  const assignments = remapByGame(s.games, games, s.assignments)
  for (const [id, a] of Object.entries(PLAN_DEFAULT_ASSIGNMENTS)) assignments[id] ??= a
  return {
    ...s,
    games,
    planVersion: PLAN_VERSION,
    scheduleSource: 'bundled',
    scheduleFetchedAt: null,
    assignments,
    overrides: remapByGame(s.games, games, s.overrides),
  }
}

interface StoreCtx {
  state: AppState
  dispatch: (a: Action) => void
  refreshSchedule: () => Promise<'ok' | 'failed'>
  refreshResale: () => Promise<'ok' | 'failed' | 'unavailable'>
  syncStatus: 'off' | 'connecting' | 'live' | 'error'
  resaleStatus: 'idle' | 'loading' | 'ok' | 'failed'
}

const Ctx = createContext<StoreCtx | null>(null)

const SIX_HOURS = 6 * 60 * 60 * 1000

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadLocal)
  const stateRef = useRef(state)
  stateRef.current = state
  const [syncStatus, setSyncStatus] = useReducer((_: StoreCtx['syncStatus'], n: StoreCtx['syncStatus']) => n, 'off')
  const [resaleStatus, setResaleStatus] = useReducer((_: StoreCtx['resaleStatus'], n: StoreCtx['resaleStatus']) => n, 'idle')
  const applyingRemote = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked */
    }
  }, [state])

  const refreshSchedule = async (): Promise<'ok' | 'failed'> => {
    try {
      const games = await fetchKrakenHomeSchedule()
      dispatch({ type: 'setSchedule', games })
      return 'ok'
    } catch {
      return 'failed'
    }
  }

  const refreshResale = async (): Promise<'ok' | 'failed' | 'unavailable'> => {
    if (!SEATGEEK_AVAILABLE) return 'unavailable'
    setResaleStatus('loading')
    try {
      const quotes = await fetchResaleQuotes(stateRef.current.games)
      dispatch({ type: 'setResale', quotes })
      setResaleStatus('ok')
      return 'ok'
    } catch {
      setResaleStatus('failed')
      return 'failed'
    }
  }

  useEffect(() => {
    const last = state.scheduleFetchedAt ? Date.parse(state.scheduleFetchedAt) : 0
    const schedulePromise = Date.now() - last > SIX_HOURS ? refreshSchedule() : Promise.resolve('ok' as const)
    const newestQuote = Math.max(0, ...Object.values(state.resale).map((q) => Date.parse(q.fetchedAt)))
    if (Date.now() - newestQuote > SIX_HOURS) void schedulePromise.then(() => refreshResale())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Live sync: the room is baked in, so this runs on every load when keys are present.
  useEffect(() => {
    if (!SYNC_AVAILABLE) {
      setSyncStatus('off')
      return
    }
    let cancelled = false
    setSyncStatus('connecting')
    ;(async () => {
      try {
        const remote = await loadBoard()
        if (cancelled) return
        if (remote && Date.parse(remote.updatedAt) > Date.parse(stateRef.current.updatedAt)) {
          applyingRemote.current = true
          dispatch({ type: 'replace', state: remote })
        } else {
          await saveBoard(stateRef.current)
        }
        setSyncStatus('live')
      } catch {
        if (!cancelled) setSyncStatus('error')
      }
    })()
    const unsub = subscribeBoard((remote) => {
      if (Date.parse(remote.updatedAt) > Date.parse(stateRef.current.updatedAt)) {
        applyingRemote.current = true
        dispatch({ type: 'replace', state: remote })
      }
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!SYNC_AVAILABLE || syncStatus !== 'live') return
    if (applyingRemote.current) {
      applyingRemote.current = false
      return
    }
    const t = setTimeout(() => {
      saveBoard(stateRef.current).catch(() => setSyncStatus('error'))
    }, 400)
    return () => clearTimeout(t)
  }, [state, syncStatus])

  const value = useMemo<StoreCtx>(
    () => ({ state, dispatch, refreshSchedule, refreshResale, syncStatus, resaleStatus }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, syncStatus, resaleStatus],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}
