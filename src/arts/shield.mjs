// Shield Scan: A shield with a tick, and a scan line passing over it.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, frac, segDist, inPolygon } from '../helpers.mjs'

const SHIELD = [
  [-0.66, -0.7],
  [0, -0.9],
  [0.66, -0.7],
  [0.62, 0.12],
  [0, 0.92],
  [-0.62, 0.12],
]

export default function field(x, y, t, p) {
  let edge = 1
  for (let i = 0; i < SHIELD.length; i++) {
    const [ax, ay] = SHIELD[i]
    const [bx, by] = SHIELD[(i + 1) % SHIELD.length]
    edge = Math.min(edge, segDist(x, y, ax, ay, bx, by))
  }
  const check = Math.min(
    segDist(x, y, -0.3, 0, -0.07, 0.28),
    segDist(x, y, -0.07, 0.28, 0.34, -0.3)
  )
  const scanY = frac(t * 0.3) * 2.2 - 1.1
  const scan = inPolygon(x, y, SHIELD) ? band(y - scanY, 1.2 * p) * 0.6 : 0
  return Math.max(
    band(edge, 0.8 * p),
    band(check, 1.1 * p) * (0.85 + 0.15 * Math.sin(t * 2)),
    scan
  )
}
