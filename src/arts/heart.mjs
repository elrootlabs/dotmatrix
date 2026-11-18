// Heart: A heart that beats and sends out a ring with each beat.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, frac } from '../helpers.mjs'

function heart(x, y) {
  const a = x * x + y * y - 1
  const f = a * a * a - x * x * y * y * y
  const gx = 6 * x * a * a - 2 * x * y * y * y
  const gy = 6 * y * a * a - 3 * x * x * y * y
  return f / (Math.hypot(gx, gy) + 1e-6) // roughly the distance to the outline
}

export default function field(x, y, t, p) {
  const u = frac(t * 0.9)
  const beat = 1 + 0.12 * Math.max(Math.exp(-((u - 0.08) ** 2) * 900), 0.7 * Math.exp(-((u - 0.28) ** 2) * 900))
  const s = 0.62 * beat
  const d = heart(x / s, -y / s - 0.1) * s
  if (d < 0) return Math.abs(d) < 0.8 * p ? 1 : 0.28 + 0.2 * (beat - 1) * 8
  if (d < 0.8 * p) return 1
  const g = 0.62 * (1 + u * 0.9)
  const ring = heart(x / g, -y / g - 0.1) * g
  return band(ring, 0.7 * p) * (1 - u) * 0.6
}
