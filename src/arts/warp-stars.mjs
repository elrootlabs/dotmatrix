// Warp Stars: Stars stream out from the centre, as if at warp speed.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, hash, TAU } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const r = Math.hypot(x, y)
  const a = Math.atan2(y, x)
  let v = 0
  for (const [n, seed] of [
    [72, 0],
    [47, 500],
  ]) {
    const k = Math.floor(((a + Math.PI) / TAU) * n)
    const h = hash(k + seed)
    const centre = ((k + 0.5 + (hash(k * 7 + seed) - 0.5) * 0.6) / n) * TAU - Math.PI
    const d = frac(t * 0.22 * (0.6 + hash(k * 3 + seed)) + h)
    const head = 0.05 + d * d * 2.8
    const len = 0.04 + d * 0.4
    if (r > head || r < head - len) continue
    if (Math.abs(Math.sin(a - centre)) * r > 0.5 * p) continue
    v = Math.max(v, 0.2 + 0.8 * d)
  }
  return v
}
