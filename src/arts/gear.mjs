// Gear: A gear turning steadily, bright rim and dim body.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { clamp } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const r = Math.hypot(x, y)
  const a = Math.atan2(y, x) - t * 0.35
  const outer = 0.62 + 0.16 * clamp(Math.cos(a * 8) * 2.5 + 0.5)
  if (r < 0.12) return 1
  if (r < 0.3 || r > outer) return 0
  return r > outer - 1.2 * p || r < 0.3 + 1.2 * p ? 0.9 : 0.4 // bright rim, dim body
}
