import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { BUNDLED_SCHEDULE } from '../data/schedule'
import { fetchKrakenHomeSchedule, remapByGame } from './nhl'
import { SYNC_AVAILABLE, loadBoard, saveBoard, subscribeBoard } from './supabase'
import type { AppState, Game, GameOverride, Owner, PersonId } from './types'
import { draftableGames, gameValue } from './value'

const STORAGE_KEY = 'release-the-tickets:v1'

export function initialState(): AppState {
  return {
    version: 1,
    people: [
      { id: 'p1', name: 'Nate', emoji: '🐙', color: '#99D9D9' },
      { id: 'p2', name: 'Friend', emoji: '🦑', color: '#E9072B' },
    ],
    games: BUNDLED_SCHEDULE,
    scheduleSource: 'bundled',
    scheduleFetchedAt: null,
    assignments: {},
    overrides: {},
    draft: { status: 'idle', first: null, picks: [] },
    trades: [],
    room: null,
    updatedAt: new Date(0).toISOString(),
  }
}

export type Action =
  | { type: 'replace'; state: AppState; keepRoom?: boolean }
  | { type: 'setPerson'; id: PersonId; patch: Partial<Omit<AppState['people'][0], 'id'>> }
  | { type: 'assign'; gameId: string; owner: Owner | null }
  | { type: 'note'; gameId: string; note: string }
  | { type: 'override'; gameId: string; patch: GameOverride }
  | { type: 'addGame'; game: Game }
  | { type: 'setSchedule'; games: Game[] }
  | { type: 'draftStart' }
  | { type: 'draftFlip'; first: PersonId }
  | { type: 'draftPick'; gameId: string }
  | { type: 'draftUndo' }
  | { type: 'draftEnd' }
  | { type: 'draftReset' }
  | { type: 'trade'; from: PersonId; gave: string; got: string | null }
  | { type: 'setRoom'; room: string | null }
  | { type: 'clearAssignments' }

function stamp(s: AppState): AppState {
  return { ...s, updatedAt: new Date().toISOString() }
}

/** Snake order: A B B A A B B A ... */
export function pickerAt(index: number, first: PersonId): PersonId {
  const second: PersonId = first === 'p1' ? 'p2' : 'p1'
  const round = Math.floor(index / 2)
  const slot = index % 2
  return round % 2 === 0 ? (slot === 0 ? first : second) : slot === 0 ? second : first
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'replace':
      return { ...action.state, room: action.keepRoom ? state.room : action.state.room }
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
    case 'override':
      return stamp({
        ...state,
        overrides: { ...state.overrides, [action.gameId]: { ...state.overrides[action.gameId], ...action.patch } },
      })
    case 'addGame':
      return stamp({ ...state, games: [...state.games, action.game] })
    case 'setSchedule': {
      const manual = state.games.filter((g) => g.source === 'manual')
      const games = [...action.games, ...manual]
      const idMap = remapByGame(
        state.games,
        games,
        Object.fromEntries(state.games.map((g) => [g.id, g.id])),
      )
      const picks = state.draft.picks.map((id) => {
        const hit = Object.entries(idMap).find(([, oldId]) => oldId === id)
        return hit ? hit[0] : id
      })
      return stamp({
        ...state,
        games,
        scheduleSource: 'nhl',
        scheduleFetchedAt: new Date().toISOString(),
        assignments: remapByGame(state.games, games, state.assignments),
        overrides: remapByGame(state.games, games, state.overrides),
        draft: { ...state.draft, picks },
      })
    }
    case 'draftStart':
      return stamp({ ...state, draft: { status: 'flipping', first: null, picks: [] } })
    case 'draftFlip':
      return stamp({ ...state, draft: { status: 'live', first: action.first, picks: [] } })
    case 'draftPick': {
      if (state.draft.status !== 'live' || !state.draft.first) return state
      if (state.draft.picks.includes(action.gameId)) return state
      const who = pickerAt(state.draft.picks.length, state.draft.first)
      const picks = [...state.draft.picks, action.gameId]
      const assignments = { ...state.assignments, [action.gameId]: { ...state.assignments[action.gameId], owner: who } }
      const remaining = draftableGames(state).filter((g) => !picks.includes(g.id) && !assignments[g.id])
      const status = remaining.length === 0 ? 'done' : 'live'
      return stamp({ ...state, assignments, draft: { ...state.draft, picks, status } })
    }
    case 'draftUndo': {
      const picks = state.draft.picks.slice()
      const last = picks.pop()
      if (!last) return state
      const assignments = { ...state.assignments }
      delete assignments[last]
      return stamp({ ...state, assignments, draft: { ...state.draft, picks, status: 'live' } })
    }
    case 'draftEnd':
      return stamp({ ...state, draft: { ...state.draft, status: 'done' } })
    case 'draftReset':
      return stamp({ ...state, draft: { status: 'idle', first: null, picks: [] } })
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
    case 'setRoom':
      return { ...state, room: action.room }
    case 'clearAssignments':
      return stamp({ ...state, assignments: {}, trades: [], draft: { status: 'idle', first: null, picks: [] } })
    default:
      return state
  }
}

function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as AppState
    if (parsed.version !== 1) return initialState()
    return { ...initialState(), ...parsed }
  } catch {
    return initialState()
  }
}

interface StoreCtx {
  state: AppState
  dispatch: (a: Action) => void
  refreshSchedule: () => Promise<'ok' | 'failed'>
  syncStatus: 'off' | 'connecting' | 'live' | 'error'
  autoPick: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadLocal)
  const stateRef = useRef(state)
  stateRef.current = state
  const [syncStatus, setSyncStatus] = useReducer((_: StoreCtx['syncStatus'], n: StoreCtx['syncStatus']) => n, 'off')
  const applyingRemote = useRef(false)

  // Persist locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked; ignore */
    }
  }, [state])

  // Live schedule refresh on first load (and whenever the bundled list is in use)
  const refreshSchedule = async (): Promise<'ok' | 'failed'> => {
    try {
      const games = await fetchKrakenHomeSchedule()
      dispatch({ type: 'setSchedule', games })
      return 'ok'
    } catch {
      return 'failed'
    }
  }
  useEffect(() => {
    const last = state.scheduleFetchedAt ? Date.parse(state.scheduleFetchedAt) : 0
    if (Date.now() - last > 6 * 60 * 60 * 1000) void refreshSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Supabase realtime sync when a room is set
  useEffect(() => {
    if (!SYNC_AVAILABLE || !state.room) {
      setSyncStatus('off')
      return
    }
    const room = state.room
    let cancelled = false
    setSyncStatus('connecting')
    ;(async () => {
      try {
        const remote = await loadBoard(room)
        if (cancelled) return
        if (remote && Date.parse(remote.updatedAt) > Date.parse(stateRef.current.updatedAt)) {
          applyingRemote.current = true
          dispatch({ type: 'replace', state: remote, keepRoom: true })
        } else {
          await saveBoard(room, stateRef.current)
        }
        setSyncStatus('live')
      } catch {
        if (!cancelled) setSyncStatus('error')
      }
    })()
    const unsub = subscribeBoard(room, (remote) => {
      if (Date.parse(remote.updatedAt) > Date.parse(stateRef.current.updatedAt)) {
        applyingRemote.current = true
        dispatch({ type: 'replace', state: remote, keepRoom: true })
      }
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [state.room])

  // Push local changes to the room (debounced)
  useEffect(() => {
    if (!SYNC_AVAILABLE || !state.room || syncStatus !== 'live') return
    if (applyingRemote.current) {
      applyingRemote.current = false
      return
    }
    const room = state.room
    const t = setTimeout(() => {
      saveBoard(room, stateRef.current).catch(() => setSyncStatus('error'))
    }, 400)
    return () => clearTimeout(t)
  }, [state, syncStatus])

  const autoPick = () => {
    const s = stateRef.current
    if (s.draft.status !== 'live') return
    const remaining = draftableGames(s).filter((g) => !s.assignments[g.id])
    if (!remaining.length) return
    const best = remaining.map((g) => ({ g, v: gameValue(g, s).total })).sort((a, b) => b.v - a.v)[0]
    dispatch({ type: 'draftPick', gameId: best.g.id })
  }

  const value = useMemo<StoreCtx>(
    () => ({ state, dispatch, refreshSchedule, syncStatus, autoPick }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, syncStatus],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}

export function usePerson(id: PersonId) {
  const { state } = useStore()
  return state.people.find((p) => p.id === id)!
}
