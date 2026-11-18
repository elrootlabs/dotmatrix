// Every art in the catalogue exists, draws something, never draws everything (except backgrounds)
// and never returns NaN, which would silently draw nothing.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { arts, mountDots } from '../src/index.mjs'

const catalog = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'))
const ASPECT = { icon: 1, card: 1.6, banner: 2.6, background: 16 / 9 }

test('the catalogue and the arts match', () => {
  assert.equal(typeof mountDots, 'function')
  assert.deepEqual(Object.keys(arts).sort(), catalog.arts.map((a) => a.id).sort())
  for (const a of catalog.arts) assert.ok(catalog.categories.some((c) => c.id === a.category), `${a.id}: unknown category`)
})

for (const art of catalog.arts) {
  test(`${art.id} draws`, () => {
    const mod = arts[art.id]
    const W = 320
    const H = Math.round(W / ASPECT[art.fit])
    const s = Math.min(W / 2.9, H / 2.2)
    const p = 8 / s
    const o = { ex: W / 2 / s, ey: H / 2 / s, text: 'HI', from: 10, hour12: false, spacing: 8 }
    let best = 0
    for (const t of [2, 3.3, 6.1]) {
      const f = mod.prepare?.(t, o)
      let lit = 0
      let all = 0
      for (let px = 4; px < W; px += 8)
        for (let py = 4; py < H; py += 8) {
          const v = mod.default((px - W / 2) / s, (py - H / 2) / s, t, p, o, f)
          assert.ok(!Number.isNaN(v), `${art.id}: NaN at t=${t}`)
          all++
          if (v >= 0.12) lit++
        }
      if (art.fit !== 'background') assert.ok(lit < all, `${art.id}: lights every dot`)
      best = Math.max(best, lit)
    }
    assert.ok(best > 0, `${art.id}: draws nothing`)
  })
}
