export function Tentacles({ tier }: { tier: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center gap-px text-sm" title={`${tier}/3 value tier`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= tier ? 'opacity-100' : 'opacity-20 grayscale'}>
          🐙
        </span>
      ))}
    </span>
  )
}
