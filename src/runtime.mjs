// The renderer: draws an art on a canvas, at most 30 frames a second, only while on screen.
// Elroot Dot Matrix, MIT licence. More arts: https://elrootlabs.com/opensource/dotmatrix
export const DOT_DEFAULTS = {
  color: '#A6E22E', // lit dots
  color2: '', // optional colour for the dimmest dots: brightness blends from color2 to color
  background: '', // '' = transparent
  grid: true, // a faint ring at every dot position
  speed: 1, // 0 = still
  spacing: 8, // px between dot centres
  size: 1, // dot size, 1 = default
  shape: 'round', // 'round' or 'square'
  play: true, // false = hold a still frame
  start: 2, // the moment (seconds) the first frame shows
  autoSpacing: false, // true = on a canvas under 360 px, scale spacing down (min 3 px) so small arts keep their shape
}

const AUTO_REF = 360
const AUTO_MIN = 3
const AUTO_MAX_DOTS = 4000
/** Smallest short side (px) an art reads at: 32 dots across at the densest auto spacing. */
export const MIN_SHORT = 32 * AUTO_MIN

const LEVELS = 8
const LEVEL_V = Array.from({ length: LEVELS }, (_, k) => 0.12 + ((k + 0.5) * 0.88) / LEVELS)
const FRAME_MS = 1000 / 30

function rgb(hex) {
  let h = String(hex).replace('#', '')
  if (h.length === 3) h = h.replace(/./g, '$&$&')
  const n = parseInt(h, 16) || 0
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** One fill colour per brightness level. */
export function dotFills(o) {
  const hi = rgb(o.color)
  const lo = o.color2 ? rgb(o.color2) : hi
  return LEVEL_V.map((v, k) => {
    const m = k / (LEVELS - 1)
    const c = lo.map((a, i) => Math.round(a + (hi[i] - a) * m))
    return `rgba(${c.join(', ')}, ${0.3 + 0.7 * v})`
  })
}

/** Ring colour for the grid: faint white on dark backgrounds, faint black on light. With no background
 * of its own the art sits on the page, so the page's colour decides (dark when unknown). */
export function ringColour(o, page = [0, 0, 0]) {
  const [r, g, b] = o.background ? rgb(o.background) : page
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)'
}

/** Grid layout for a W x H area: dot count, offsets and the unit scale s. */
export function dotGrid(W, H, o) {
  const short = Math.min(W, H)
  const P =
    o.autoSpacing && short > 0 && short < AUTO_REF
      ? Math.max(Math.min(AUTO_MIN, o.spacing), (o.spacing * short) / AUTO_REF, Math.min(o.spacing, Math.sqrt((W * H) / AUTO_MAX_DOTS)))
      : o.spacing
  const cols = Math.floor(W / P)
  const rows = Math.floor(H / P)
  return { P, cols, rows, ox: (W - (cols - 1) * P) / 2, oy: (H - (rows - 1) * P) / 2, s: Math.min(W / 2.9, H / 2.2) }
}

/** Brightness level 0..LEVELS-1 for a field value, or -1 for an unlit dot. */
export const dotLevel = (v) => (v >= 0.12 ? Math.min(LEVELS - 1, (((v - 0.12) * LEVELS) / 0.88) | 0) : -1)
export const dotRadius = (k, o, P = o.spacing) => ((1.3 + 1.4 * LEVEL_V[k]) * o.size * P) / 8

/** The colour behind the canvas as [r, g, b] (near enough to tell light from dark): the first
 * ancestor with an opaque background. Reads rgb(), color(srgb …), and the lightness of (ok)lab/lch. */
export function pageColour(el) {
  for (; el && window.getComputedStyle; el = el.parentElement) {
    const c = window.getComputedStyle(el).backgroundColor || ''
    const m = c.split(/[\s,/()]+/).filter((w) => /^[\d.]+$/.test(w)) // numbers only, not the 3 in display-p3
    if (m.length < 3 || (m.length > 3 && Number(m[3]) <= 0.5)) continue
    const n = m.slice(0, 3).map(Number)
    if (/^oklab|^oklch/.test(c)) return [n[0] * 255, n[0] * 255, n[0] * 255]
    if (/^lab|^lch/.test(c)) return [n[0] * 2.55, n[0] * 2.55, n[0] * 2.55]
    return c.startsWith('color(') ? n.map((v) => v * 255) : n
  }
  if (!window.getComputedStyle) return undefined
  return /dark/.test(window.getComputedStyle(document.documentElement).colorScheme || '') ? [0, 0, 0] : [255, 255, 255]
}

export function mountDots(canvas, field, options, prepare) {
  const ctx = canvas.getContext('2d')
  const bg = document.createElement('canvas')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let o = { ...DOT_DEFAULTS, ...options }
  let fills = dotFills(o)
  let W = 0
  let H = 0
  let g = dotGrid(0, 0, o)
  let raf = 0
  let last = 0
  let seen = false
  let t = o.start

  const setup = () => {
    const dpr = window.devicePixelRatio || 1
    ;({ width: W, height: H } = canvas.getBoundingClientRect())
    canvas.width = bg.width = W * dpr
    canvas.height = bg.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    g = dotGrid(W, H, o)
    o.ex = W / 2 / g.s
    o.ey = H / 2 / g.s
    fills = dotFills(o)
    const b = bg.getContext('2d')
    b.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (o.background) {
      b.fillStyle = o.background
      b.fillRect(0, 0, W, H)
    }
    if (!o.grid) return
    const rr = (1.8 * g.P) / 8
    b.strokeStyle = ringColour(o, o.background ? undefined : pageColour(canvas.parentElement))
    b.lineWidth = 1
    b.beginPath()
    for (let i = 0; i < g.cols; i++)
      for (let j = 0; j < g.rows; j++) {
        const px = g.ox + i * g.P
        const py = g.oy + j * g.P
        if (o.shape === 'square') b.rect(px - rr, py - rr, 2 * rr, 2 * rr)
        else {
          b.moveTo(px + rr, py)
          b.arc(px, py, rr, 0, Math.PI * 2)
        }
      }
    b.stroke()
  }

  const draw = () => {
    if (!g.cols || !g.rows) return // not laid out yet (0 x 0)
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(bg, 0, 0, W, H)
    const { P, cols, rows, ox, oy, s } = g
    const f = prepare ? prepare(t, o) : undefined
    const paths = []
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const px = ox + i * P
        const py = oy + j * P
        const k = dotLevel(field((px - W / 2) / s, (py - H / 2) / s, t, P / s, o, f))
        if (k < 0) continue
        const r = dotRadius(k, o, P)
        const path = (paths[k] ??= new Path2D())
        if (o.shape === 'square') path.rect(px - r * 0.886, py - r * 0.886, r * 1.772, r * 1.772)
        else {
          path.moveTo(px + r, py)
          path.arc(px, py, r, 0, Math.PI * 2)
        }
      }
    paths.forEach((path, k) => {
      ctx.fillStyle = fills[k]
      ctx.fill(path)
    })
  }

  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (now - last < FRAME_MS) return
    if (last) t += (Math.min(now - last, 100) / 1000) * o.speed
    last = now
    draw()
  }

  const run = () => {
    cancelAnimationFrame(raf)
    last = 0
    if (seen && o.play && o.speed > 0 && !reduce) raf = requestAnimationFrame(loop)
  }

  setup()
  draw()
  const io = new IntersectionObserver(([e]) => {
    seen = e.isIntersecting
    run()
  })
  const ro = new ResizeObserver(() => {
    setup()
    draw()
  })
  io.observe(canvas)
  ro.observe(canvas)
  const retheme = () => {
    if (o.background) return
    setup()
    draw()
  }
  const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(retheme)
  for (const el of [document.documentElement, document.body]) if (el) mo?.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] })
  const scheme = window.matchMedia('(prefers-color-scheme: dark)')
  scheme.addEventListener?.('change', retheme)
  return {
    /** Change any options; the rest stay as they are. */
    update(next) {
      o = { ...o, ...next }
      setup()
      draw()
      run()
    },
    destroy() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      mo?.disconnect()
      scheme.removeEventListener?.('change', retheme)
    },
  }
}
