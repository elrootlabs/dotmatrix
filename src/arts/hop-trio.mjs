// Hop Trio: Three dots hop one after another, like someone thinking.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac } from '../helpers.mjs'

export default function field(x, y, t) {
  const c = frac(t * 0.7) * 1.8
  let v = 0
  for (let k = 0; k < 3; k++) {
    const u = c - k * 0.32
    const h = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0
    const cx = (k - 1) * 0.6
    const cy = 0.22 - 0.55 * h
    if (Math.hypot(x - cx, y - cy) < 0.2) v = Math.max(v, 0.55 + 0.45 * h)
    if (Math.abs(y - 0.5) < 0.05 && Math.abs(x - cx) < 0.2 - 0.12 * h) v = Math.max(v, 0.3)
  }
  return v
}
