// Truchet Tiles: Quarter-circle tiles flip one by one and redraw the maze.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { band, hash } from '../helpers.mjs'

const C = 0.62 // tile size

export default function field(x, y, t, p) {
  const i = Math.floor(x / C)
  const j = Math.floor(y / C)
  const u = x / C - i
  const v = y / C - j
  const seed = hash(i * 37 + j * 113)
  const flips = Math.floor(t * 0.35 + seed * 9) // each tile flips on its own clock
  const turned = hash(i * 7 + j * 19 + flips * 3.1) > 0.5
  const d = turned
    ? Math.min(Math.abs(Math.hypot(u, v) - 0.5), Math.abs(Math.hypot(1 - u, 1 - v) - 0.5))
    : Math.min(Math.abs(Math.hypot(1 - u, v) - 0.5), Math.abs(Math.hypot(u, 1 - v) - 0.5))
  const fresh = Math.max(0, 1 - ((t * 0.35 + seed * 9) % 1) * 3) // a tile glows just after it flips
  return band(d * C, 0.8 * p) * (0.55 + 0.45 * fresh)
}
