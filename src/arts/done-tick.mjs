// Done Tick: A circle draws itself, then a tick appears inside it.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, segDist, smooth, TAU } from '../helpers.mjs'

const A = [-0.36, 0.02]
const B = [-0.1, 0.28]
const C = [0.4, -0.28]
const L1 = Math.hypot(B[0] - A[0], B[1] - A[1])
const L2 = Math.hypot(C[0] - B[0], C[1] - B[1])

export default function field(x, y, t, p) {
  const u = frac(t * 0.28)
  const fade = 1 - smooth(0.9, 1, u)
  const ring = smooth(0, 0.4, u)
  const tick = smooth(0.42, 0.62, u)
  let v = 0
  const r = Math.hypot(x, y)
  if (Math.abs(r - 0.8) < 0.08) v = frac(Math.atan2(x, -y) / TAU) <= ring ? 0.95 * fade : 0.14
  if (r < 0.7 && u > 0.62 && u < 0.92) v = Math.max(v, 0.14)
  const d1 = segDist(x, y, A[0], A[1], B[0], B[1])
  const d2 = segDist(x, y, B[0], B[1], C[0], C[1])
  if (Math.min(d1, d2) < Math.max(0.07, 0.8 * p)) {
    const along = d1 < d2 ? Math.hypot(x - A[0], y - A[1]) : L1 + Math.hypot(x - B[0], y - B[1])
    if (along / (L1 + L2) <= tick) v = Math.max(v, fade)
  }
  return v
}
