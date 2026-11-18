// Chase Ring: Three dots chase each other round a ring, the leader brightest.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band } from '../helpers.mjs'

export function prepare(t) {
  const a = t * 2.4 - Math.PI / 2
  return [0, 1, 2].map((k) => {
    const b = a - k * (0.78 + 0.22 * Math.sin(t * 2.4))
    return [0.7 * Math.cos(b), 0.7 * Math.sin(b)]
  })
}

export default function field(x, y, t, p, o, dots) {
  let v = band(Math.hypot(x, y) - 0.7, 0.7 * p) * 0.25
  for (let k = 0; k < 3; k++)
    if (Math.hypot(x - dots[k][0], y - dots[k][1]) < 0.16 - k * 0.025) v = Math.max(v, 1 - k * 0.28)
  return v
}
