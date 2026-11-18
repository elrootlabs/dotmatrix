// Upload: An arrow rises out of a tray, again and again.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
import { frac, lineDist } from '../helpers.mjs'

const TRAY = [
  [-0.62, 0.3],
  [-0.62, 0.62],
  [0.62, 0.62],
  [0.62, 0.3],
]

export default function field(x, y, t, p) {
  let v = lineDist(x, y, TRAY) < 0.75 * p ? 0.7 : 0
  const u = frac(t * 0.55)
  const tip = 0.3 - u * 1.15
  const alpha = Math.sin(Math.PI * u)
  const arrow = Math.min(
    lineDist(x, y, [
      [0, tip],
      [0, tip + 0.7],
    ]),
    lineDist(x, y, [
      [-0.36, tip + 0.36],
      [0, tip],
      [0.36, tip + 0.36],
    ])
  )
  if (arrow < 0.9 * p && y < 0.55) v = Math.max(v, 0.2 + 0.8 * alpha)
  return v
}
