// Ripple: Rings spread outward from one bright point.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { clamp, band, frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const r = Math.hypot(x, y)
  if (r < 0.14) return 1
  const f = frac(r * 2.6 - t * 0.45)
  return band(Math.min(f, 1 - f) / 2.6, 0.8 * p) * clamp(1.15 - r)
}
