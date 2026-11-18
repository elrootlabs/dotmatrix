// Turning Cube: A wireframe cube turning to show every side.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { segDist } from '../helpers.mjs'

const CUBE = [-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [-1, 1].map((c) => [a, b, c])))
const CUBE_EDGES = CUBE.flatMap((u, i) =>
  CUBE.map((w, j) => [i, j]).filter(
    ([, j]) => j > i && u.filter((c, k) => c !== CUBE[j][k]).length === 1
  )
)

export function prepare(t) {
  const a = t * 0.5
  return CUBE.map(([cx, cy, cz]) => {
    const rx = cx * Math.cos(a) + cz * Math.sin(a)
    const rz = -cx * Math.sin(a) + cz * Math.cos(a)
    const ry = cy * Math.cos(0.45) - rz * Math.sin(0.45)
    const depth = cy * Math.sin(0.45) + rz * Math.cos(0.45)
    return [rx * 0.6, ry * 0.6, depth]
  })
}

export default function field(x, y, t, p, o, pts) {
  let v = 0
  const m = 0.8 * p
  for (const [i, j] of CUBE_EDGES) {
    const [ax, ay, az] = pts[i]
    const [bx, by, bz] = pts[j]
    if (x < Math.min(ax, bx) - m || x > Math.max(ax, bx) + m || y < Math.min(ay, by) - m || y > Math.max(ay, by) + m) continue
    if (segDist(x, y, ax, ay, bx, by) < 0.8 * p) v = Math.max(v, az + bz > 0 ? 0.4 : 1)
  }
  return v
}
