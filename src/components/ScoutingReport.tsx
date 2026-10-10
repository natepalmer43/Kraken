import { teamInfo } from '../data/teams'
import { fmtRecord, fmtStanding } from '../lib/nhl'
import type { GameBlurb, TeamRecord } from '../lib/types'
import { fmtDate } from '../lib/value'

/** Two-sided standings line: Kraken on the left, the opponent on the right. */
export function RecordStrip({ sea, opp, opponent, compact }: { sea?: TeamRecord; opp?: TeamRecord; opponent: string; compact?: boolean }) {
  if (!sea && !opp) return null
  const t = teamInfo(opponent)
  const cell = (label: string, r: TeamRecord | undefined, align: 'left' | 'right') => (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="pixel whitespace-nowrap text-[7px] text-silver/70">
        {label.toUpperCase()}
        {r?.streak ? ` · ${r.streak}` : ''}
      </div>
      <div className={`led ${compact ? 'text-base' : 'text-xl'} ${r ? '' : 'dim'}`}>{fmtRecord(r)}</div>
      {r && <div className="pixel mt-0.5 whitespace-nowrap text-[7px] text-silver/80">{fmtStanding(r).toUpperCase()}</div>}
    </div>
  )
  return (
    <div className={`jumbotron flex items-center justify-between ${compact ? 'px-3 py-2' : 'p-3'}`}>
      {cell('Kraken', sea, 'left')}
      <div className="pixel text-[8px] text-silver/50">VS</div>
      {cell(t.name || opponent, opp, 'right')}
    </div>
  )
}

/** Hand-written game notes from src/data/blurbs.ts, laid out like the back of a hockey card. */
export function ScoutingReport({ blurb, opponent }: { blurb: GameBlurb; opponent: string }) {
  const t = teamInfo(opponent)
  const [c1] = t.colors
  return (
    <section className="card90 overflow-hidden">
      <div className="flex items-center justify-between border-b-[3px] border-ink bg-navy px-3 py-1.5">
        <span className="pixel text-[8px] text-amber">SCOUTING REPORT</span>
        <span className="pixel text-[7px] text-silver/70">UPDATED {fmtDate(blurb.updated, { month: 'short', day: 'numeric' }).toUpperCase()}</span>
      </div>
      <div className="p-3">
        <h3 className="display text-2xl leading-tight">{blurb.headline}</h3>
        <p className="mt-2 text-sm font-semibold leading-snug">{blurb.story}</p>
        {blurb.rivalry && (
          <p className="mt-2 border-l-4 border-red pl-2 text-sm italic text-steel">{blurb.rivalry}</p>
        )}
        {blurb.stars.length > 0 && (
          <div className="mt-3">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-steel">Players to watch</div>
            <ul className="mt-1 grid gap-1.5 sm:grid-cols-2">
              {blurb.stars.map((s) => (
                <li key={s.name} className="flex items-start gap-2 text-sm">
                  <span
                    className="display mt-0.5 shrink-0 border-2 border-ink px-1 text-[11px] leading-4 text-white"
                    style={{ background: s.team === 'SEA' ? '#001628' : c1, textShadow: '1px 1px 0 #0a0a0a' }}
                  >
                    {s.team === 'SEA' ? 'SEA' : opponent}
                  </span>
                  <span>
                    <span className="font-extrabold">{s.name}</span>
                    <span className="text-steel"> · {s.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
