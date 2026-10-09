import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AppState } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const SYNC_AVAILABLE = Boolean(url && key)

/**
 * The shared board lives in one fixed room. Both phones land in it
 * automatically, so there is nothing to type in Settings.
 */
export const ROOM = 'release-the-tickets-2025-26'

let client: SupabaseClient | null = null
function sb(): SupabaseClient {
  if (!client) client = createClient(url!, key!)
  return client
}

export async function loadBoard(): Promise<AppState | null> {
  const { data, error } = await sb().from('boards').select('state').eq('id', ROOM).maybeSingle()
  if (error) throw error
  return (data?.state as AppState | undefined) ?? null
}

export async function saveBoard(state: AppState): Promise<void> {
  const { error } = await sb()
    .from('boards')
    .upsert({ id: ROOM, state, updated_at: new Date().toISOString() })
  if (error) throw error
}

export function subscribeBoard(onChange: (state: AppState) => void): () => void {
  const channel = sb()
    .channel(`board:${ROOM}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'boards', filter: `id=eq.${ROOM}` }, (payload) => {
      const next = (payload.new as { state?: AppState } | null)?.state
      if (next) onChange(next)
    })
    .subscribe()
  return () => {
    void sb().removeChannel(channel)
  }
}
