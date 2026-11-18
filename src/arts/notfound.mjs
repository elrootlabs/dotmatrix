// 404: The number 404 in a dot font, with a scan line passing down.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac } from '../helpers.mjs'

const GLYPHS = ['#.#.###.#.#', '#.#.#.#.#.#', '###.#.#.###', '..#.#.#...#', '..#.###...#']

export default function field(x, y, t, p) {
  const c = Math.max(0.2, 2.6 * p) // one glyph cell, at least ~2.6 dots wide
  const col = Math.floor(x / c + GLYPHS[0].length / 2)
  const row = Math.floor(y / c + GLYPHS.length / 2)
  if (
    row < 0 ||
    row >= GLYPHS.length ||
    col < 0 ||
    col >= GLYPHS[0].length ||
    GLYPHS[row][col] !== '#'
  )
    return 0
  const scan = frac(t * 0.25) * (GLYPHS.length + 3) - 1.5
  return Math.abs(row - scan) < 0.6 ? 1 : 0.7
}
