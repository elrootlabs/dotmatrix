// Typing Bubble: A message bubble with someone typing.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, segDist } from '../helpers.mjs'

export default function field(x, y, t, p) {
  const qx = Math.max(Math.abs(x) - 0.65, 0)
  const qy = Math.max(Math.abs(y + 0.1) - 0.3, 0)
  const box = Math.hypot(qx, qy) - 0.2 // rounded rectangle, 0 on the outline
  const tail = Math.min(
    segDist(x, y, -0.5, 0.39, -0.62, 0.72),
    segDist(x, y, -0.62, 0.72, -0.2, 0.39)
  )
  let v = Math.max(box > -0.1 ? band(box, 0.8 * p) : 0, band(tail, 0.8 * p))
  for (let k = 0; k < 3; k++) {
    const cy = -0.1 - 0.12 * Math.max(0, Math.sin(t * 4 - k * 0.8))
    if (Math.hypot(x - (k - 1) * 0.32, y - cy) < 0.1) v = 1
  }
  return v
}
