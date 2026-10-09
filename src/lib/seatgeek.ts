import type { Game, ResaleQuote } from './types'
import { resaleKey } from './value'

const clientId = import.meta.env.VITE_SEATGEEK_CLIENT_ID as string | undefined
export const SEATGEEK_AVAILABLE = Boolean(clientId)

interface SgEvent {
  id: number
  title: string
  url: string
  datetime_local: string
  performers: Array<{ slug: string; home_team?: boolean }>
  stats: {
    listing_count: number | null
    average_price: number | null
    median_price: number | null
    lowest_price: number | null
    highest_price: number | null
  }
}

/**
 * Pulls the live resale market for every Kraken home game from SeatGeek's
 * public API and keys it by date+opponent so it lines up with our schedule.
 * Prices are per ticket, in USD, across all listings on the platform.
 */
export async function fetchResaleQuotes(games: Game[], signal?: AbortSignal): Promise<Record<string, ResaleQuote>> {
  if (!clientId) throw new Error('No SeatGeek client id')
  const url = new URL('https://api.seatgeek.com/2/events')
  url.searchParams.set('performers.slug', 'seattle-kraken')
  url.searchParams.set('per_page', '100')
  url.searchParams.set('client_id', clientId)
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`SeatGeek ${res.status}`)
  const json = (await res.json()) as { events: SgEvent[] }

  const byDate = new Map<string, Game[]>()
  for (const g of games) byDate.set(g.date, [...(byDate.get(g.date) ?? []), g])

  const out: Record<string, ResaleQuote> = {}
  const now = new Date().toISOString()
  for (const ev of json.events) {
    const kraken = ev.performers.find((p) => p.slug === 'seattle-kraken')
    if (!kraken?.home_team) continue
    const date = ev.datetime_local.slice(0, 10)
    const candidates = byDate.get(date) ?? []
    // Match the opponent by name if there are two games the same day (never, but cheap).
    const game = candidates.length === 1 ? candidates[0] : candidates.find((g) => ev.title.toLowerCase().includes(g.opponent.toLowerCase()))
    if (!game) continue
    out[resaleKey(game)] = {
      average: ev.stats.average_price,
      median: ev.stats.median_price,
      lowest: ev.stats.lowest_price,
      highest: ev.stats.highest_price,
      listings: ev.stats.listing_count ?? 0,
      url: ev.url,
      fetchedAt: now,
    }
  }
  return out
}
