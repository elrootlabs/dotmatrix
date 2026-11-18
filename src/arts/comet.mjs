// Comet: A comet streaks past the stars, its tail fading behind it.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, hash } from '../helpers.mjs'

export default function field(x, y, t, p, o) {
  const u = frac(t * 0.11)
  const hx = -o.ex - 0.6 + u * (2 * o.ex + 2.2)
  const hy = -0.35 + u * 0.55
  const dx = x - hx
  const dy = y - hy
  const along = -(dx * 0.97 + dy * 0.24) // > 0 behind the head
  const across = Math.abs(-dx * 0.24 + dy * 0.97)
  if (Math.hypot(dx, dy) < 0.09) return 1
  if (along > 0 && along < 1.6 && across < 0.03 + along * 0.12) {
    const fade = 1 - along / 1.6
    const flicker = hash(Math.round(x / p) * 3 + Math.round(y / p) * 7 + Math.floor(t * 8)) > 0.35
    return flicker ? 0.2 + 0.75 * fade * (1 - across / (0.03 + along * 0.12)) : 0
  }
  const h = hash(Math.round(x / p) * 57 + Math.round(y / p) * 131)
  return h > 0.982 ? 0.18 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + h * 50)) : 0
}
