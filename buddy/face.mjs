// Buddy Face: a dot-matrix face that shows what your coding agent is doing. Options: mood.
// Moods: idle (blinks), thinking (eyes look around), waiting (wide eyes, needs you), happy, sad, sleepy.
// Kept in step with the face on https://elrootlabs.com/opensource/dotmatrix/desk-buddy
import { band, clamp, frac } from '../src/helpers.mjs'

// a crisp line about two dots thick at any size
const line = (d, p) => (d < 1.1 * p ? 1 : 0)

export const MOODS = ['idle', 'thinking', 'waiting', 'happy', 'sad', 'sleepy']

const EYE_X = 0.42
const EYE_Y = -0.18
const MOUTH_Y = 0.42

// distance to an arc of a circle centred (cx, cy), radius r, between angles a0 and a1 (y points down)
function arc(x, y, cx, cy, r, a0, a1) {
  const a = Math.atan2(y - cy, x - cx)
  if (a >= a0 && a <= a1) return Math.abs(Math.hypot(x - cx, y - cy) - r)
  const d0 = Math.hypot(x - cx - r * Math.cos(a0), y - cy - r * Math.sin(a0))
  const d1 = Math.hypot(x - cx - r * Math.cos(a1), y - cy - r * Math.sin(a1))
  return Math.min(d0, d1)
}

function eyes(x, y, t, mood, p) {
  let v = 0
  for (const s of [-1, 1]) {
    const ex = s * EYE_X
    if (mood === 'happy') v = Math.max(v, line(arc(x, y, ex, EYE_Y + 0.08, 0.14, -Math.PI, 0), p)) // ^ ^
    else if (mood === 'sleepy' || (mood === 'idle' && frac(t / 4) > 0.95)) v = Math.max(v, line(Math.hypot(Math.max(Math.abs(x - ex) - 0.13, 0), y - EYE_Y), p)) // closed: a line
    else if (mood === 'sad') {
      // droopy: the outer half of the eye is cut by a slanted lid
      const lid = y - EYE_Y - (0.12 * s * (x - ex)) / 0.15 + 0.02
      if (Math.hypot(x - ex, y - EYE_Y) < 0.13 && lid > 0) v = 1
    } else {
      const r = mood === 'waiting' ? 0.17 : 0.13
      const look = mood === 'thinking' ? 0.07 * Math.sin(t * 1.6) : 0
      const d = Math.hypot(x - ex - look, y - EYE_Y + (mood === 'thinking' ? 0.03 : 0))
      if (d < r) v = 1
      else if (mood === 'waiting') v = Math.max(v, line(Math.abs(d - r - 0.06), p) * 0.5) // a ring: eyes wide open
    }
  }
  return v
}

function mouth(x, y, t, mood, p) {
  if (mood === 'happy') return line(arc(x, y, 0, MOUTH_Y - 0.26, 0.36, 0.2 * Math.PI, 0.8 * Math.PI), p)
  if (mood === 'sad') return line(arc(x, y, 0, MOUTH_Y + 0.26, 0.3, -0.78 * Math.PI, -0.22 * Math.PI), p)
  if (mood === 'waiting') return line(Math.abs(Math.hypot(x, y - MOUTH_Y) - 0.08), p) // a small "o"
  if (mood === 'sleepy') return line(Math.hypot(Math.max(Math.abs(x) - 0.1, 0), y - MOUTH_Y), p)
  if (mood === 'thinking') {
    // a flat mouth, and three dots that light in turn beside the head
    let v = line(Math.hypot(Math.max(Math.abs(x + 0.05) - 0.14, 0), y - MOUTH_Y), p)
    for (let k = 0; k < 3; k++) {
      const on = Math.floor(t * 3) % 3 === k ? 1 : 0.3
      if (Math.hypot(x - 0.62 - k * 0.14, y + 0.62) < 0.045) v = Math.max(v, on)
    }
    return v
  }
  return line(arc(x, y, 0, MOUTH_Y - 0.2, 0.28, 0.27 * Math.PI, 0.73 * Math.PI), p) // idle: a soft smile
}

// floating "z"s for sleepy
function zees(x, y, t, p) {
  let v = 0
  for (let k = 0; k < 2; k++) {
    const u = frac(t * 0.35 + k * 0.5)
    const cx = 0.55 + u * 0.35
    const cy = -0.55 - u * 0.4
    const s = 0.06 + 0.04 * u
    const lx = x - cx
    const ly = y - cy
    if (Math.abs(lx) > s + p || Math.abs(ly) > s + p) continue
    const top = band(Math.hypot(Math.max(Math.abs(lx) - s, 0), ly + s), 0.8 * p)
    const bot = band(Math.hypot(Math.max(Math.abs(lx) - s, 0), ly - s), 0.8 * p)
    const diag = Math.abs(lx + ly) < 0.9 * p && Math.abs(lx) <= s ? 1 : 0
    v = Math.max(v, Math.max(top, bot, diag) * (1 - u))
  }
  return v
}

export default function field(x, y, t, p, o) {
  const m = o?.mood
  const mood = MOODS.includes(m) ? m : (MOODS[Math.round(Number(m))] ?? 'idle')
  const bob = mood === 'sleepy' ? 0.03 * Math.sin(t * 1.2) : mood === 'happy' ? 0.03 * Math.abs(Math.sin(t * 4)) : 0
  const yy = y + bob
  let v = Math.max(eyes(x, yy, t, mood, p), mouth(x, yy, t, mood, p))
  if (mood === 'sleepy') v = Math.max(v, zees(x, y, t, p))
  if (mood === 'waiting') v *= 0.75 + 0.25 * Math.abs(Math.sin(t * 3)) // a gentle pulse: it needs you
  // a faint round head outline
  v = Math.max(v, 0.18 * band(Math.hypot(x, y) - 0.92, 0.9 * p))
  return clamp(v)
}
