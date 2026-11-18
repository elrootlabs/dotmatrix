// Orbit Core: A dense core with three nodes on a tilted orbit.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { TAU, band } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const c = Math.cos(-0.3)
  const s = Math.sin(-0.3)
  const u = x * c - y * s
  const w = x * s + y * c
  const r = Math.hypot(x, y)
  let v = r < 0.34 ? 0.55 + 0.45 * Math.sin(x * 9 + t * 1.6) * Math.sin(y * 9 - t) : 0
  const e = Math.hypot(u / 1.15, w / 0.42) - 1
  if (Math.sin(Math.atan2(w / 0.42, u / 1.15) * 28) > 0)
    v = Math.max(v, band(e * 0.6, 0.7 * p) * 0.6)
  for (let k = 0; k < 3; k++) {
    const a = t * 0.6 + (k * TAU) / 3
    const behind = Math.sin(a) < 0 && r < 0.34
    const dist = Math.hypot(u - 1.15 * Math.cos(a), w - 0.42 * Math.sin(a))
    if (dist < 0.14 && !behind) v = 1
  }
  return v
}
