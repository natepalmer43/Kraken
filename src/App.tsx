import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Background } from './components/Background'
import { HomeTab } from './components/HomeTab'
import { LedgerTab } from './components/LedgerTab'
import { ScheduleTab } from './components/ScheduleTab'
import { SettingsTab } from './components/SettingsTab'
import { Sheet } from './components/Sheet'
import { useToast } from './components/Toast'
import { SEASON_LABEL } from './data/schedule'
import { useStore } from './lib/store'
import { clearShareHash, readShareFromUrl } from './lib/share'
import type { AppState } from './lib/types'
import { fmtDate, fmtMoney, fmtTime, resaleFor, upcomingGames } from './lib/value'

type Tab = 'home' | 'schedule' | 'ledger' | 'settings'

const TABS: Array<{ id: Tab; label: string; short: string }> = [
  { id: 'home', label: 'Home', short: '1ST' },
  { id: 'schedule', label: 'Schedule', short: '2ND' },
  { id: 'ledger', label: 'Ledger', short: '3RD' },
  { id: 'settings', label: 'Settings', short: 'OT' },
]

const ICON = `${import.meta.env.BASE_URL}kraken.svg`

export default function App() {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('home')
  const [incoming, setIncoming] = useState<AppState | null>(() => readShareFromUrl())

  const acceptShare = () => {
    if (incoming) dispatch({ type: 'replace', state: incoming, keepRoom: true })
    setIncoming(null)
    clearShareHash()
    toast('Board updated from share link')
  }

  const ticker = upcomingGames(state)
    .slice(0, 8)
    .map((g) => {
      const o = state.assignments[g.id]?.owner
      const who = o === 'both' ? 'BOTH' : o === 'sell' ? 'SELLING' : o ? state.people.find((p) => p.id === o)!.name.toUpperCase() : 'OPEN'
      const r = resaleFor(g, state).value
      return `SEA VS ${g.opponent} · ${fmtDate(g.date, { month: 'short', day: 'numeric' }).toUpperCase()} ${fmtTime(g.time)} · ${who}${r ? ` · ${fmtMoney(r)}` : ''}`
    })
  const tickerText = (ticker.length ? ticker : ['NO UPCOMING HOME GAMES']).join('   ★   ') + '   ★   '

  return (
    <div className="scanlines min-h-dvh pb-28 sm:pb-10">
      <Background />
      <div className="stripe-band h-3 border-b-[3px] border-ink" />

      <header className="mx-auto max-w-3xl px-4 pt-4">
        <div className="jumbotron p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <img src={ICON} alt="" className="h-12 w-12 border-2 border-silver/40 sm:h-14 sm:w-14" />
            <div className="min-w-0 flex-1">
              <div className="led text-[13px] leading-tight sm:text-xl">RELEASE THE TICKETS</div>
              <div className="pixel mt-1 text-[8px] text-silver/80 sm:text-[9px]">
                {state.people[0].emoji} {state.people[0].name.toUpperCase()} &amp; {state.people[1].emoji} {state.people[1].name.toUpperCase()} · {SEASON_LABEL}
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="pixel text-[8px] text-silver/70">SEATTLE</div>
              <div className="led red text-sm">KRAKEN</div>
            </div>
          </div>
          <div className="mt-3 overflow-hidden border-t border-silver/20 pt-2">
            <div className="ticker-track led text-[9px] sm:text-[10px]" style={{ animationDuration: `${Math.max(20, ticker.length * 9)}s` }}>
              <span className="whitespace-pre">{tickerText}</span>
              <span className="whitespace-pre" aria-hidden>{tickerText}</span>
            </div>
          </div>
        </div>

        <nav className="mt-4 hidden gap-2 sm:flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn90 flex-1 ${tab === t.id ? 'red' : 'white'}`}>
              <span className="pixel mr-2 text-[8px] opacity-70">{t.short}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {tab === 'home' && <HomeTab goTo={setTab} />}
            {tab === 'schedule' && <ScheduleTab />}
            {tab === 'ledger' && <LedgerTab />}
            {tab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex gap-1 border-[3px] border-ink bg-ink p-1 shadow-hard sm:hidden" style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-1 flex-col items-center py-1.5 ${tab === t.id ? 'bg-red' : ''}`}>
            <span className={`pixel text-[8px] ${tab === t.id ? 'text-white' : 'text-amber'}`}>{t.short}</span>
            <span className={`display mt-0.5 text-sm ${tab === t.id ? 'text-white' : 'text-silver'}`}>{t.label}</span>
          </button>
        ))}
      </nav>

      <Sheet open={Boolean(incoming)} onClose={() => { setIncoming(null); clearShareHash() }} title="Incoming board">
        {incoming && (
          <>
            <p className="text-sm font-semibold">
              {incoming.people[0].emoji} {incoming.people[0].name} &amp; {incoming.people[1].emoji} {incoming.people[1].name} shared their board, last updated {new Date(incoming.updatedAt).toLocaleString()}.
              Replace what you have here with it?
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={acceptShare} className="btn90 flex-1">Use shared board</button>
              <button onClick={() => { setIncoming(null); clearShareHash() }} className="btn90 white">Keep mine</button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}

