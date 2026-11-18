// Checklist: A checklist that ticks itself off, line by line.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, segDist } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const done = frac(t * 0.12) * 6
  for (let k = 0; k < 4; k++) {
    const cy = -0.6 + k * 0.4
    const ticked = done > k + 1
    const box = Math.max(Math.abs(x + 0.7), Math.abs(y - cy)) - 0.13
    if (Math.abs(box) < 0.6 * p) return ticked ? 0.9 : 0.5
    if (
      ticked &&
      Math.min(
        segDist(x, y, -0.78, cy, -0.71, cy + 0.07),
        segDist(x, y, -0.71, cy + 0.07, -0.6, cy - 0.08)
      ) <
        0.6 * p
    )
      return 1
    if (Math.abs(y - cy) < 0.6 * p && x > -0.42 && x < 0.95 - ((k * 5) % 3) * 0.25)
      return ticked ? 0.85 : 0.3
  }
  return 0
}
