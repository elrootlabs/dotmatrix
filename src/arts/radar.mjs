// Radar Sweep: A beam turns around a round screen and leaves fading blips.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, frac, TAU } from '../helpers.mjs'

const BLIPS = [
  [0.36, -0.44],
  [-0.56, 0.22],
  [0.2, 0.6],
  [-0.3, -0.66],
  [0.68, 0.14],
]

export default function field(x, y, t, p) {
  const r = Math.hypot(x, y)
  if (r > 0.98) return 0
  if (r > 0.92) return band(r - 0.95, 0.6 * p) * 0.5
  const a = t * 1.3
  const theta = Math.atan2(y, x)
  let v = 0
  if (Math.abs(r - 0.32) < 0.45 * p || Math.abs(r - 0.62) < 0.45 * p) v = 0.17
  if ((Math.abs(x) < 0.45 * p || Math.abs(y) < 0.45 * p) && Math.sin(r * 60) > 0) v = 0.17
  const behind = frac((a - theta) / TAU) // 0 on the beam, growing behind it
  if (behind < 0.2) v = Math.max(v, 0.9 * (1 - behind / 0.2) ** 1.6)
  for (const [bx, by] of BLIPS)
    if (Math.hypot(x - bx, y - by) < 0.075) {
      const since = frac((a - Math.atan2(by, bx)) / TAU)
      v = Math.max(v, Math.max(0.15, 1 - since * 1.4))
    }
  return v
}
