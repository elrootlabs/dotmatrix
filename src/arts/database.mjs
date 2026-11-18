// Database: A stack of database disks, each written to in turn.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const active = Math.floor(frac(t * 0.3) * 3)
  let v = 0
  for (let k = 0; k < 3; k++) {
    const top = -0.62 + k * 0.42
    const b = k === active ? 1 : 0.5
    const rim = Math.abs(Math.hypot(x / 0.75, (y - top) / 0.18) - 1) * 0.18
    if (rim < 0.7 * p) v = Math.max(v, b)
    const base = Math.abs(Math.hypot(x / 0.75, (y - top - 0.3) / 0.18) - 1) * 0.18
    if (base < 0.7 * p && y > top + 0.3) v = Math.max(v, b * 0.8)
    if (Math.abs(Math.abs(x) - 0.75) < 0.6 * p && y > top && y < top + 0.3)
      v = Math.max(v, b * 0.8)
  }
  return v
}
