// Merging Rings: Two rings drift together until they overlap, then part.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const d = 0.08 + 0.42 * (0.5 + 0.5 * Math.cos(t * 0.7))
  const a = Math.hypot(x - d, y) - 0.5
  const b = Math.hypot(x + d, y) - 0.5
  return Math.max(band(a, 0.8 * p), band(b, 0.8 * p), a < 0 && b < 0 ? 0.45 : 0)
}
