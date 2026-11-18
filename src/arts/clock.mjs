// Clock: A digital clock showing the viewer's local time, its colon blinking.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
const FONT = {
  ' ': '...../...../...../...../...../...../.....',
  0: '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
  1: '..#../.##../..#../..#../..#../..#../.###.',
  2: '.###./#...#/....#/...#./..#../.#.../#####',
  3: '####./....#/....#/.###./....#/....#/####.',
  4: '...#./..##./.#.#./#..#./#####/...#./...#.',
  5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '..##./.#.../#..../####./#...#/#...#/.###.',
  7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.',
  9: '.###./#...#/#...#/.####/....#/...#./.##..',
  ':': '...../.##../.##../...../.##../.##../.....',
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#',
  P: '####./#...#/#...#/####./#..../#..../#....',
  M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#',
}
const two = (n) => String(n).padStart(2, '0')

export function prepare(t, o) {
  const d = new Date()
  const h = d.getHours()
  const colon = d.getMilliseconds() < 500 ? ':' : ' '
  const hh = o.hour12 ? two(h % 12 || 12) : two(h)
  const ampm = o.hour12 ? (h < 12 ? ' AM' : ' PM') : ''
  const long = hh + colon + two(d.getMinutes()) + colon + two(d.getSeconds()) + ampm
  const short = hh + colon + two(d.getMinutes()) + ampm
  return [long, short].map((s) => [...s].map((c) => FONT[c]))
}

export default function field(x, y, t, p, o, [long, short]) {
  const glyphs = long.length * 6 - 1 <= (2 * o.ex) / p ? long : short
  const w = glyphs.length * 6 - 1
  const c = p * Math.max(1, Math.round(Math.min(0.22, (1.8 * o.ex) / w, (1.6 * o.ey) / 7) / p))
  const row = Math.floor(y / c + 3.5)
  const col = Math.floor(x / c + w / 2)
  if (row < 0 || row > 6 || col < 0 || col >= w || col % 6 === 5) return 0
  return glyphs[Math.floor(col / 6)][row * 6 + (col % 6)] === '#' ? 1 : 0
}
