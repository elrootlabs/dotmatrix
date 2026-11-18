// Layers: Three platform layers breathe apart and settle again.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const gap = 0.32 + 0.1 * Math.sin(t * 0.9)
  let v = 0
  for (let k = -1; k <= 1; k++) {
    const m = Math.abs(x) / 0.85 + Math.abs(y - k * gap) / 0.34 - 1
    v = Math.max(v, band(m * 0.32, 0.8 * p) * (k === -1 ? 1 : 0.7), k === -1 && m < 0 ? 0.4 : 0)
  }
  return v
}
