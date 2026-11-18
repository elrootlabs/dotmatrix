// Rising Bars: Bars rise to their measured height against a dashed target line.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { clamp, frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  if (Math.abs(y - 0.8) < 0.7 * p && Math.abs(x) < 0.95) return 0.5
  if (Math.abs(y + 0.3) < 0.7 * p && Math.abs(x) < 0.95 && Math.sin(x * 40) > 0) return 0.45
  const H = [0.55, 0.85, 0.4, 1.25, 0.75]
  const grow = frac(t * 0.12) * 1.8
  for (let k = 0; k < 5; k++) {
    const top = 0.75 - H[k] * clamp((grow - k * 0.15) * 2.5)
    if (Math.abs(x - (-0.72 + k * 0.36)) < 0.1 && y < 0.75 && y > top) return k === 3 ? 1 : 0.75
  }
  return 0
}
