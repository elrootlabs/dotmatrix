// Spiral: A spiral arm winds outward and keeps turning.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, TAU } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const r = Math.hypot(x, y)
  if (r > 1) return 0
  if (r < 0.08) return 1
  const turns = 2.6
  const q = r * turns - (Math.atan2(y, x) / TAU) * 2 + t * 0.35
  const f = q - Math.floor(q)
  return band(Math.min(f, 1 - f) / turns, 0.9 * p) * (1.05 - r * 0.55)
}
