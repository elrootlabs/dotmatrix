// Equaliser: Columns of dots bounce like an audio level meter.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { hash } from '../helpers.mjs'

const N = 11
const level = (k, t) =>
  0.15 + 0.85 * Math.abs(Math.sin(t * (1.1 + hash(k) * 1.9) + k * 1.7) * Math.sin(t * (0.5 + hash(k + 9)) + k))

export function prepare(t) {
  return Array.from({ length: N }, (_, k) => [level(k, t), Math.max(level(k, t), level(k, t - 0.25) * 0.94, level(k, t - 0.5) * 0.86)])
}

export default function field(x, y, t, p, o, cols) {
  const k = Math.round((x + 1.25) / 0.25)
  if (k < 0 || k >= N || Math.abs(x - (-1.25 + k * 0.25)) > 0.1) return 0
  if (y > 0.8 || y < -0.85) return 0
  const [h, peak] = cols[k]
  const top = 0.8 - 1.5 * h
  if (y >= top) return 0.4 + 0.6 * ((0.8 - y) / 1.5) // brighter towards the top
  if (Math.abs(y - (0.8 - 1.5 * peak) + 0.06) < 0.6 * p) return 0.9
  return 0
}
