// Rainfall: Rain falls in thin streaks and splashes where it lands.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, hash } from '../helpers.mjs'

export default function field(x, y, t, p, o) {
  const ground = o.ey * 0.82
  if (Math.abs(y - ground) < 0.5 * p) return 0.22
  const lane = 2.2 * p // one column of rain every couple of dots
  const xs = x + (y + o.ey) * 0.18 // rain falls at a slight slant
  const i = Math.floor(xs / lane)
  if (Math.abs(xs - (i + 0.5) * lane) > 0.5 * p) {
    const k = Math.round(x / lane - 0.5)
    const s = frac(t * (0.7 + hash(k) * 0.5) + hash(k + 50))
    const sx = (k + 0.5) * lane - (ground + o.ey) * 0.18
    if (s < 0.16) {
      const r = Math.hypot(x - sx, (y - ground) * 2.2)
      if (y < ground && Math.abs(r - s * 1.6) < 0.7 * p) return 0.7 * (1 - s / 0.16)
    }
    return 0
  }
  if (y > ground) return 0
  const h = hash(i)
  const head = -o.ey - 0.4 + frac(t * (0.7 + h * 0.5) + hash(i + 50)) * (ground + o.ey + 0.4)
  const tail = y - head // negative above the head
  if (tail > 0 || tail < -0.38) return 0
  return 0.25 + 0.75 * (1 + tail / 0.38)
}
