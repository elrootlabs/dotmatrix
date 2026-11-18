// Ringed Planet: A planet with a tilted ring that passes in front of it and behind.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, TAU } from '../helpers.mjs'

const TILT = -0.32

export default function field(x, y, t, p) {
  const c = Math.cos(TILT)
  const s = Math.sin(TILT)
  const u = x * c - y * s // along the ring
  const w = x * s + y * c // across it
  const e = Math.hypot(u / 1.25, w / 0.32) // 1 on the ring's outer edge
  const onRing = e > 0.72 && e < 1 && Math.sin(e * 46) > -0.5
  const r = Math.hypot(x, y)
  const front = w > 0 // the near half of the ring
  const dash = frac(Math.atan2(w / 0.32, u / 1.25) / TAU * 18 - t * 0.4) < 0.75
  if (onRing && (front || r > 0.5)) return dash ? (front ? 0.85 : 0.5) : 0.25
  if (r < 0.5) {
    const z = Math.sqrt(0.25 - r * r) / 0.5
    const light = Math.max(0, (-x * 0.5 - y * 0.6 + z * 0.62) / 0.5)
    const bands = Math.sin((y + 0.08 * x) * 22) > 0.7 ? 0.15 : 0
    return 0.2 + 0.65 * Math.min(1, light) - bands
  }
  const a = t * 0.5
  if (Math.hypot(x - 1.45 * Math.cos(a), y - 0.55 * Math.sin(a) + 0.2) < 0.07 && Math.sin(a) > -0.2) return 0.9
  return 0
}
