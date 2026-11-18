// Sunrise: The sun rises over the horizon while its rays turn slowly.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, smooth } from '../helpers.mjs'

const HORIZON = 0.45

export default function field(x, y, t, p) {
  const u = frac(t * 0.07)
  const cy = HORIZON + 0.55 - 1.1 * smooth(0, 0.55, u) // rises, holds, then sinks back at the end
  const sy = cy + 1.1 * smooth(0.85, 1, u)
  if (Math.abs(y - HORIZON) < 0.5 * p) return 0.6
  const r = Math.hypot(x, y - sy)
  if (y < HORIZON) {
    if (r < 0.5) return Math.sin((y - sy) * 26) > -0.6 || y < sy ? 0.9 : 0 // the lower half has bands
    const a = Math.atan2(y - sy, x)
    if (r < 1.15 && Math.sin(a * 14 + t * 0.4) > 0.55) return 0.45 * (1.15 - r) * 2
    return 0
  }
  const d = y - HORIZON
  if (Math.abs(x) < 0.5 - d * 0.5 && Math.sin(d * 40) > 0.6 && Math.sin(x * 9 + t * 2 + d * 20) > 0) return 0.5 - d * 0.6
  return 0
}
