// Chip: A chip with pins, sending signal rings outward.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { clamp, band, frac } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const ax = Math.abs(x)
  const ay = Math.abs(y)
  const box = Math.max(ax, ay)
  if (box < 0.36) return box > 0.36 - 1.2 * p ? 0.95 : box < 0.14 ? 0.8 : 0
  const along = ax > ay ? y : x
  const pin = Math.min(Math.abs(along + 0.2), Math.abs(along), Math.abs(along - 0.2))
  if (box < 0.54 && pin < 0.6 * p) return 0.7
  const r = Math.hypot(x, y)
  const f = frac(r * 2.2 - t * 0.5)
  return r > 0.72 ? band(Math.min(f, 1 - f) / 2.2, 0.7 * p) * clamp(1.5 - r) : 0
}
