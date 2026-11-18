// Neural Net: A small neural network with signals running from inputs to outputs.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, segDist } from '../helpers.mjs'

const NET = [
  [
    [-1.0, -0.55],
    [-1.0, 0],
    [-1.0, 0.55],
  ],
  [
    [0, -0.75],
    [0, -0.25],
    [0, 0.25],
    [0, 0.75],
  ],
  [
    [1.0, -0.3],
    [1.0, 0.3],
  ],
]

export default function field(x, y, t, p) {
  let v = 0
  const m = Math.max(0.6 * p, 0.06) // nothing on a link reaches further than this from it
  for (let a = 0; a < NET.length - 1; a++)
    for (const [ax, ay] of NET[a])
      for (const [bx, by] of NET[a + 1]) {
        if (x < Math.min(ax, bx) - m || x > Math.max(ax, bx) + m || y < Math.min(ay, by) - m || y > Math.max(ay, by) + m) continue
        if (segDist(x, y, ax, ay, bx, by) < 0.6 * p) v = Math.max(v, 0.25)
        const q = frac(t * 0.45 + (ax * 3 + ay * 5 + by * 7) * 0.37)
        if (Math.hypot(x - ax - (bx - ax) * q, y - ay - (by - ay) * q) < 0.06) v = 1
      }
  for (const layer of NET)
    for (const [nx, ny] of layer) if (Math.hypot(x - nx, y - ny) < 0.12) v = Math.max(v, 0.9)
  return v
}
