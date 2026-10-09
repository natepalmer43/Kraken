import confetti from 'canvas-confetti'

const NINETIES = ['#0B1F3A', '#D7263D', '#1FB5A8', '#FFC914', '#5B2A86', '#ffffff']

export function burst(origin?: { x: number; y: number }) {
  confetti({ particleCount: 90, spread: 75, startVelocity: 38, colors: NINETIES, origin: origin ?? { y: 0.7 }, scalar: 0.95 })
}

/** Goal horn: flashing goal light, confetti from both corners, and a synthesized arena horn. */
export function goalHorn() {
  flashGoalLight()
  playHorn()
  const end = Date.now() + 1800
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: NINETIES })
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: NINETIES })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  setTimeout(() => confetti({ particleCount: 160, spread: 120, startVelocity: 45, colors: NINETIES, origin: { y: 0.5 }, scalar: 1.2 }), 500)
}

function flashGoalLight() {
  const el = document.createElement('div')
  el.className = 'goal-light'
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2400)
}

let audio: AudioContext | null = null
function playHorn() {
  try {
    audio ??= new AudioContext()
    const ctx = audio
    if (ctx.state === 'suspended') void ctx.resume()
    const t0 = ctx.currentTime
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0001, t0)
    master.gain.exponentialRampToValueAtTime(0.5, t0 + 0.08)
    master.gain.setValueAtTime(0.5, t0 + 1.3)
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.9)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(900, t0)
    lp.frequency.linearRampToValueAtTime(1600, t0 + 0.4)
    lp.connect(master).connect(ctx.destination)
    // A real horn is a stack of slightly detuned saws: fat and buzzy.
    for (const [freq, detune] of [[146.8, 0], [146.8, 7], [220.0, -5], [293.7, 3]] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq * 0.97, t0)
      osc.frequency.linearRampToValueAtTime(freq, t0 + 0.12)
      osc.detune.setValueAtTime(detune, t0)
      const g = ctx.createGain()
      g.gain.value = 0.22
      osc.connect(g).connect(lp)
      osc.start(t0)
      osc.stop(t0 + 2)
    }
  } catch {
    /* no audio, no problem */
  }
}
