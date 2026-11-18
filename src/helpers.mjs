// Maths helpers the arts share.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
export const TAU = Math.PI * 2
export const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** 1 on the line, 0 at distance w from it. */
export const band = (d, w) => clamp(1 - Math.abs(d) / w)
export const frac = (v) => v - Math.floor(v)
export const mix = (a, b, k) => a + (b - a) * k
export const smooth = (a, b, v) => {
  const k = clamp((v - a) / (b - a))
  return k * k * (3 - 2 * k)
}
/** Repeatable pseudo-random number in 0..1 for any number n. */
export const hash = (n) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453)
/** Smooth value noise in 0..1. */
export function noise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const h = (i, j) => hash(i * 57 + j * 113)
  return mix(mix(h(ix, iy), h(ix + 1, iy), ux), mix(h(ix, iy + 1), h(ix + 1, iy + 1), ux), uy)
}
/** Distance from point p to the segment a-b. */
export function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const h = clamp(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))
  return Math.hypot(px - ax - dx * h, py - ay - dy * h)
}
/** Distance to an open polyline [[x, y], ...]. */
export function lineDist(px, py, pts) {
  let d = Infinity
  for (let i = 0; i < pts.length - 1; i++)
    d = Math.min(d, segDist(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]))
  return d
}
export function inPolygon(x, y, pts) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
/**
 * Groups points [x, y, ...] into square cells of size c. The returned near(x, y, visit) calls visit
 * for every point in the 3 x 3 cells around (x, y), so a dot only checks points that can reach it.
 * Make c at least the largest reach a point has.
 */
export function bucket(points, c) {
  const cells = new Map()
  for (const q of points) {
    const k = Math.floor(q[0] / c) * 7919 + Math.floor(q[1] / c)
    const a = cells.get(k)
    if (a) a.push(q)
    else cells.set(k, [q])
  }
  return (x, y, visit) => {
    const i = Math.floor(x / c)
    const j = Math.floor(y / c)
    for (let di = -1; di <= 1; di++)
      for (let dj = -1; dj <= 1; dj++) {
        const a = cells.get((i + di) * 7919 + j + dj)
        if (a) for (const q of a) visit(q)
      }
  }
}
