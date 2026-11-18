// Typing Page: A page whose lines type themselves out, then start over.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { clamp, frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const edge = Math.max(Math.abs(x) - 0.62, Math.abs(y) - 0.84)
  if (Math.abs(edge) < 0.6 * p) return 0.75
  if (edge > 0) return 0
  const typed = frac(t * 0.1) * 8 // lines finished so far
  for (let i = 0; i < 6; i++) {
    const len = 0.84 - ((i * 37) % 5) * 0.12
    if (
      Math.abs(y - (-0.56 + i * 0.22)) < 0.6 * p &&
      x > -0.42 &&
      x < -0.42 + len * clamp(typed - i)
    )
      return 0.95
  }
  return 0
}
