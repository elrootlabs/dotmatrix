// Network: A network with pulses travelling along its links.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, segDist } from '../helpers.mjs'

const NODES = [
  [-1.25, -0.45],
  [-0.55, 0.5],
  [0, -0.35],
  [0.6, 0.45],
  [1.25, -0.4],
  [1.3, 0.55],
]
const EDGES = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
]

export default function field(x, y, t, p) {
  let v = 0
  const m = Math.max(0.6 * p, 0.08) // nothing on a link reaches further than this from it
  for (let k = 0; k < EDGES.length; k++) {
    const [ax, ay] = NODES[EDGES[k][0]]
    const [bx, by] = NODES[EDGES[k][1]]
    if (x < Math.min(ax, bx) - m || x > Math.max(ax, bx) + m || y < Math.min(ay, by) - m || y > Math.max(ay, by) + m) continue
    const d = segDist(x, y, ax, ay, bx, by)
    if (d < 0.6 * p) v = Math.max(v, 0.35)
    const q = frac(t * 0.35 + k * 0.37) // pulse position along the link
    if (Math.hypot(x - ax - (bx - ax) * q, y - ay - (by - ay) * q) < 0.08) v = 1
  }
  for (const [nx, ny] of NODES) if (Math.hypot(x - nx, y - ny) < 0.13) v = Math.max(v, 0.9)
  return v
}
