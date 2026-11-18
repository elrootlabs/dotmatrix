// Scope Wave: An oscilloscope trace that shifts as the signal changes.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const edge = Math.max(Math.abs(x) - 1.2, Math.abs(y) - 0.72)
  if (Math.abs(edge) < 0.6 * p) return 0.55
  if (edge > 0) return 0
  if ((Math.abs(x) < 0.6 * p || Math.abs(y) < 0.6 * p) && Math.sin((x + y) * 45) > 0.3)
    return 0.25
  const f = (u) =>
    0.38 * Math.sin(3.2 * u - t * 1.8) * (0.65 + 0.35 * Math.sin(t * 0.6 + u * 1.3))
  const slope = (f(x + 0.01) - f(x - 0.01)) / 0.02
  return band((y - f(x)) / Math.sqrt(1 + slope * slope), 0.9 * p)
}
