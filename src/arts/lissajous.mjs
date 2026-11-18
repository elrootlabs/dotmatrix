// Lissajous: A Lissajous curve whose loops slowly shift as the phase drifts.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { bucket, TAU } from '../helpers.mjs'

const N = 220

export function prepare(t) {
  const d = t * 0.25
  const head = (t * 0.18) % 1
  const pts = []
  for (let i = 0; i < N; i++) {
    const s = (i / N) * TAU
    const age = (head - i / N + 1) % 1 // 0 at the pen, growing behind it
    pts.push([1.25 * Math.sin(3 * s + d), 0.82 * Math.sin(2 * s), age])
  }
  return bucket(pts, 0.12)
}

export default function field(x, y, t, p, o, near) {
  let v = 0
  const w = 0.9 * p
  near(x, y, (q) => {
    const d = Math.hypot(x - q[0], y - q[1])
    if (d < w) v = Math.max(v, (q[2] < 0.03 ? 1 : 0.85 - q[2] * 0.6) * (1 - d / w / 2))
  })
  return v
}
