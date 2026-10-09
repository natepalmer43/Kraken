import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import type { AppState } from './types'

export function encodeShare(state: AppState): string {
  const payload = { ...state, room: null }
  return compressToEncodedURIComponent(JSON.stringify(payload))
}

export function shareUrl(state: AppState): string {
  const url = new URL(window.location.href)
  url.hash = `s=${encodeShare(state)}`
  return url.toString()
}

export function readShareFromUrl(): AppState | null {
  const hash = window.location.hash
  if (!hash.startsWith('#s=')) return null
  try {
    const json = decompressFromEncodedURIComponent(hash.slice(3))
    if (!json) return null
    const parsed = JSON.parse(json) as AppState
    if (parsed.version !== 1 || !Array.isArray(parsed.games)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearShareHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}
