// Fireflies: Small lights wander about and blink on and off.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { bucket, hash, smooth } from '../helpers.mjs'

export function prepare(t, o) {
  const n = Math.round(Math.max(14, Math.min(48, o.ex * o.ey * 10)))
  const pts = []
  for (let i = 0; i < n; i++) {
    const glow = smooth(0.2, 0.9, Math.sin(t * (0.7 + hash(i * 11) * 0.8) + i * 4))
    if (glow <= 0) continue
    pts.push([
      (hash(i) * 2 - 1) * o.ex * 0.92 + 0.3 * Math.sin(t * 0.3 * (1 + hash(i * 3)) + i),
      (hash(i * 7) * 2 - 1) * o.ey * 0.85 + 0.25 * Math.cos(t * 0.27 * (1 + hash(i * 5)) + i * 2),
      glow,
    ])
  }
  return bucket(pts, 0.2)
}

export default function field(x, y, t, p, o, near) {
  let v = 0
  near(x, y, (q) => {
    const d = Math.hypot(x - q[0], y - q[1])
    if (d < 0.06 + 0.3 * p) v = Math.max(v, q[2])
    else if (d < 0.18) v = Math.max(v, q[2] * 0.3) // soft halo
  })
  return v
}
