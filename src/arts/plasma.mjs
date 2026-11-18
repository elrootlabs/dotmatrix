// Plasma: Soft blobs of brightness flow and mix across the grid.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
export default function field(x, y, t) {
  const v =
    Math.sin(x * 2.6 + t * 0.9) +
    Math.sin(y * 3.1 - t * 0.7) +
    Math.sin((x + y) * 1.9 + t * 0.5) +
    Math.sin(Math.hypot(x - Math.sin(t * 0.37), y - Math.cos(t * 0.29)) * 4.2)
  return ((v + 4) / 8) ** 2.2
}
