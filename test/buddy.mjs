// The desk buddy server: moods in, moods out, nothing else, and only for this machine.
import assert from 'node:assert/strict'
import { request } from 'node:http'
import { after, before, test } from 'node:test'

import { createBuddy } from '../buddy/buddy.mjs'
import face, { MOODS } from '../buddy/face.mjs'

let buddy
let port
before(async () => {
  buddy = createBuddy({ sleepAfter: 200 })
  await new Promise((r) => buddy.server.listen(0, '127.0.0.1', r))
  port = buddy.server.address().port
})
after(() => buddy.server.close())

const call = (method, path, host = `127.0.0.1:${port}`) =>
  new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, method, path, headers: { host } }, (res) => {
      let body = ''
      res.on('data', (d) => (body += d))
      res.on('end', () => resolve({ status: res.statusCode, body }))
    })
    req.on('error', reject)
    req.end()
  })

test('every mood draws something and never NaN', () => {
  for (const mood of MOODS) {
    let lit = 0
    for (let y = -1; y <= 1; y += 0.05) for (let x = -1.3; x <= 1.3; x += 0.05) {
      const v = face(x, y, 1.3, 0.03, { mood, ex: 1.3, ey: 1 })
      assert.ok(Number.isFinite(v), `${mood} gave ${v}`)
      if (v > 0.5) lit++
    }
    assert.ok(lit > 10, `${mood} lights ${lit} dots`)
  }
})

test('a known mood is set and read back', async () => {
  assert.equal((await call('POST', '/mood/happy')).status, 204)
  assert.equal((await call('GET', '/mood')).body, 'happy')
})

test('an unknown mood is refused', async () => {
  assert.equal((await call('POST', '/mood/hacked')).status, 400)
  assert.notEqual((await call('GET', '/mood')).body, 'hacked')
})

test('only the listed files are served', async () => {
  assert.equal((await call('GET', '/')).status, 200)
  assert.equal((await call('GET', '/package.json')).status, 404)
  assert.equal((await call('GET', '/src/../package.json')).status, 404)
})

test('a request for another host name is refused (DNS rebinding)', async () => {
  assert.equal((await call('GET', '/mood', 'evil.example:4747')).status, 403)
  assert.equal((await call('POST', '/mood/sad', 'evil.example')).status, 403)
})

test('it falls asleep when nothing happens', async () => {
  await call('POST', '/mood/thinking')
  await new Promise((r) => setTimeout(r, 350))
  assert.equal((await call('GET', '/mood')).body, 'sleepy')
})
