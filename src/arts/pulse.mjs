// Heartbeat Line: A heart monitor trace that keeps running across the screen.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { clamp, band, frac, segDist } from '../helpers.mjs'

const BEAT = [
  [0, 0],
  [0.45, 0],
  [0.52, -0.15],
  [0.58, 0],
  [0.66, 0],
  [0.71, 0.22],
  [0.77, -0.75],
  [0.83, 0.4],
  [0.89, 0],
  [1.4, 0],
]

export default function field(x, y, t, p) {
  if (y < -0.75 - 0.8 * p || y > 0.4 + 0.8 * p) return 0 // further from the trace than a line is thick
  const u = frac((x + t * 0.45) / 1.4) * 1.4
  let d = 1
  for (let i = 0; i < BEAT.length - 1; i++) {
    const [ax, ay] = BEAT[i]
    const [bx, by] = BEAT[i + 1]
    d = Math.min(d, segDist(u, y, ax, ay, bx, by))
  }
  return band(d, 0.8 * p) * clamp(1.6 - Math.abs(x) * 0.6)
}
