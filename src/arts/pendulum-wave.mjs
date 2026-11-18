// Pendulum Wave: A row of pendulums swings at slightly different speeds and forms waves.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { segDist } from '../helpers.mjs'

const N = 15
const TOP = -0.95

export function prepare(t, o) {
  const span = Math.min(o.ex - 0.3, 2.6)
  return Array.from({ length: N }, (_, k) => {
    const a = 0.55 * Math.sin((t * Math.PI * 2 * (20 + k)) / 60)
    const px = -span + (2 * span * k) / (N - 1)
    return [px, px + 1.55 * Math.sin(a), TOP + 1.55 * Math.cos(a)]
  })
}

export default function field(x, y, t, p, o, bobs) {
  if (Math.abs(y - TOP) < 0.5 * p && Math.abs(x) < o.ex - 0.15) return 0.4
  let v = 0
  for (const [px, bx, by] of bobs) {
    if (Math.abs(x - bx) > 0.6 && Math.abs(x - px) > 0.6) continue
    if (Math.hypot(x - bx, y - by) < 0.1) return 1
    if (segDist(x, y, px, TOP, bx, by) < 0.4 * p) v = 0.22
  }
  return v
}
