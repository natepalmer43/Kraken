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

type Tab = 'home' | 'schedule' | 'ledger' | 'settings'

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
  { id: 'ledger', label: 'Ledger', icon: '⚖️' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

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

  return (
    <div className="min-h-dvh pb-24 sm:pb-8">
      <Background />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <img src="/kraken.svg" alt="" className="h-10 w-10 rounded-xl shadow-glow" />
          <div>
            <div className="display text-3xl leading-none"><span className="ice-text">Release the Tickets</span></div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-shadow">{state.people[0].emoji} {state.people[0].name} & {state.people[1].emoji} {state.people[1].name} · {SEASON_LABEL}</div>
          </div>
        </div>
        <nav className="glass hidden items-center gap-1 rounded-full p-1 sm:flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition ${tab === t.id ? 'text-deep' : 'text-foam/80 hover:text-foam'}`}>
              {tab === t.id && <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-ice" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-3">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {tab === 'home' && <HomeTab goTo={setTab} />}
            {tab === 'schedule' && <ScheduleTab />}
            {tab === 'ledger' && <LedgerTab />}
            {tab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="glass-strong fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-3xl px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] sm:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-semibold">
            {tab === t.id && <motion.span layoutId="mobile-pill" className="absolute inset-0 rounded-2xl bg-ice/15" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            <span className={`relative text-xl transition ${tab === t.id ? 'scale-110' : 'opacity-70'}`}>{t.icon}</span>
            <span className={`relative ${tab === t.id ? 'text-ice' : 'text-shadow'}`}>{t.label}</span>
          </button>
        ))}
      </nav>

      <Sheet open={Boolean(incoming)} onClose={() => { setIncoming(null); clearShareHash() }} title="Incoming board">
        {incoming && (
          <>
            <p className="text-sm text-foam/80">
              {incoming.people[0].emoji} {incoming.people[0].name} & {incoming.people[1].emoji} {incoming.people[1].name} shared their board, last updated {new Date(incoming.updatedAt).toLocaleString()}.
              Replace what you have here with it?
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={acceptShare} className="flex-1 rounded-full bg-ice px-4 py-3 font-extrabold text-deep">Use shared board</button>
              <button onClick={() => { setIncoming(null); clearShareHash() }} className="rounded-full bg-white/5 px-4 py-3 font-semibold">Keep mine</button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}
