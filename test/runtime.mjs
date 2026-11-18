// The renderer draws each art on a canvas, using only a canvas and the browser's observers.
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { arts, mountDots } from '../src/index.mjs'

function fakePage() {
  const calls = { fills: 0, rings: 0 }
  const ctx = new Proxy({}, { get: (_, k) => (k === 'fill' ? () => calls.fills++ : k === 'stroke' ? () => calls.rings++ : () => {}) })
  const canvas = { width: 0, height: 0, getContext: () => ctx, getBoundingClientRect: () => ({ width: 400, height: 250 }) }
  Object.assign(globalThis, {
    window: { matchMedia: () => ({ matches: false }), devicePixelRatio: 2 },
    document: { createElement: () => ({ ...canvas }) },
    IntersectionObserver: class { observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    Path2D: class { moveTo() {} arc() {} rect() {} },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  })
  return { canvas, calls }
}

for (const [id, mod] of Object.entries(arts)) {
  test(`${id} draws on a canvas`, () => {
    const { canvas, calls } = fakePage()
    const dots = mountDots(canvas, mod.default, { color: '#FFB000', text: 'HI' }, mod.prepare)
    assert.equal(calls.rings, 1)
    assert.ok(calls.fills > 0)
    dots.update({ shape: 'square', speed: 2 })
    dots.destroy()
  })
}
