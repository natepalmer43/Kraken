import confetti from 'canvas-confetti'

const KRAKEN = ['#99D9D9', '#E9072B', '#68A2B9', '#ffffff', '#355464']

export function krakenBurst(origin?: { x: number; y: number }) {
  confetti({ particleCount: 90, spread: 75, startVelocity: 38, colors: KRAKEN, origin: origin ?? { y: 0.7 }, scalar: 0.95 })
}

export function releaseTheKraken() {
  const end = Date.now() + 1800
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: KRAKEN })
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: KRAKEN })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  setTimeout(() => confetti({ particleCount: 160, spread: 120, startVelocity: 45, colors: KRAKEN, origin: { y: 0.5 }, shapes: ['circle'], scalar: 1.2 }), 500)
}
