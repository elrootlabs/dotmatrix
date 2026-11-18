// App Window: An app window whose selected row moves down the list.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const edge = Math.max(Math.abs(x) - 1.15, Math.abs(y) - 0.78)
  if (Math.abs(edge) < 0.6 * p) return 0.75
  if (edge > 0) return 0
  if (Math.abs(y + 0.52) < 0.6 * p) return 0.5
  for (let k = 0; k < 3; k++) if (Math.hypot(x - (-1.0 + k * 0.13), y + 0.65) < 0.045) return 0.8
  if (Math.abs(x + 0.62) < 0.6 * p && y > -0.52) return 0.4
  const sel = Math.floor(frac(t * 0.22) * 4)
  for (let k = 0; k < 4; k++) {
    const ry = -0.28 + k * 0.26
    if (Math.abs(y - ry) > 0.6 * p) continue
    if (x > -1.0 && x < -0.75) return 0.45
    if (x > -0.45 && x < 0.95 - ((k * 3) % 4) * 0.22) return k === sel ? 1 : 0.4
  }
  return 0
}
