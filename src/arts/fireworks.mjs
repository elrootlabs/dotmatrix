// Fireworks: Rockets rise and burst into rings of sparks that fade.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { bucket, hash, TAU } from '../helpers.mjs'

export function prepare(t) {
  const pts = []
  for (let s = 0; s < 3; s++) {
    const c = t / 2.8 + s / 3
    const n = Math.floor(c) // which launch this is
    const u = c - n
    const bx = (hash(n * 7 + s) - 0.5) * 2
    const by = -0.35 - hash(n * 11 + s) * 0.35
    if (u < 0.28) {
      const q = u / 0.28
      for (let k = 0; k < 3; k++) pts.push([bx, 1.1 - (1.1 - by) * (q - k * 0.04), 1 - k * 0.3])
      continue
    }
    const q = (u - 0.28) / 0.72 // 0 at the burst, 1 when it has faded
    const R = 0.62 * Math.sqrt(q)
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * TAU + hash(n + s) * 2
      for (let j = 0; j < 2; j++) {
        const rr = R * (1 - j * 0.12)
        pts.push([bx + Math.cos(a) * rr, by + Math.sin(a) * rr + q * q * 0.35, (1 - q) * (1 - j * 0.45)])
      }
    }
  }
  return bucket(pts, 0.12)
}

export default function field(x, y, t, p, o, near) {
  let v = 0
  near(x, y, (q) => {
    if (Math.hypot(x - q[0], y - q[1]) < 0.035 + 0.4 * p) v = Math.max(v, q[2])
  })
  return v
}
