// Packet Pipeline: A packet runs along six stages and lights each one it passes.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const head = -1.4 + frac(t * 0.12) * 2.9
  let v = Math.abs(y) < 0.7 * p && Math.abs(x) < 1.25 ? (x < head ? 0.7 : 0.3) : 0
  for (let k = 0; k < 6; k++) {
    const d = Math.hypot(x - (-1.25 + k * 0.5), y)
    if (d < 0.17) v = Math.max(v, -1.25 + k * 0.5 < head ? 1 : band(d - 0.17, 0.8 * p) || 0.15)
  }
  return Math.hypot(x - head, y) < 0.09 ? 1 : v
}
