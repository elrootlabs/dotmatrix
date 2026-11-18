// Breathing Grid: The grid brightens and dims in slow waves from the centre.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
export default function field(x, y, t) {
  const r = Math.hypot(x * 0.8, y)
  const wave = 0.5 + 0.5 * Math.sin(r * 3.2 - t * 1.3)
  return 0.13 + 0.8 * wave ** 3 * Math.max(0.35, 1 - r * 0.25)
}
