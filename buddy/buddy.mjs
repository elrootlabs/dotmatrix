#!/usr/bin/env node
// Elroot Dot Matrix desk buddy: a face that shows what your coding agent is doing.
//   node buddy/buddy.mjs            then open http://127.0.0.1:4747
//   curl -X POST http://127.0.0.1:4747/mood/thinking   (your agent's hooks do this)
// Zero dependencies. Listens on 127.0.0.1 only. MIT licence. https://elrootlabs.com/opensource/dotmatrix/desk-buddy
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

import { MOODS } from './face.mjs'

const PORT = Number(process.env.BUDDY_PORT) || 4747
const HOST = '127.0.0.1'
const SLEEP_AFTER_MS = 2 * 60 * 1000

// The only files this server hands out.
const FILES = {
  '/': ['buddy/index.html', 'text/html; charset=utf-8'],
  '/buddy/face.mjs': ['buddy/face.mjs', 'text/javascript; charset=utf-8'],
  '/src/runtime.mjs': ['src/runtime.mjs', 'text/javascript; charset=utf-8'],
  '/src/helpers.mjs': ['src/helpers.mjs', 'text/javascript; charset=utf-8'],
}
const root = new URL('../', import.meta.url)

export function createBuddy({ sleepAfter = SLEEP_AFTER_MS } = {}) {
  let mood = 'idle'
  let timer
  const clients = new Set()
  const set = (m) => {
    mood = m
    for (const res of clients) res.write(`data: ${m}\n\n`)
    clearTimeout(timer)
    if (m !== 'sleepy') timer = setTimeout(() => set('sleepy'), sleepAfter)
  }

  const server = createServer((req, res) => {
    // Only this machine, by name: a web page can't reach us through a DNS trick.
    const host = (req.headers.host ?? '').replace(/:\d+$/, '')
    if (host !== '127.0.0.1' && host !== 'localhost') return res.writeHead(403).end()
    const path = new URL(req.url, 'http://x').pathname

    if (req.method === 'POST' && path.startsWith('/mood/')) {
      req.resume() // bodies are ignored
      const m = path.slice(6)
      if (!MOODS.includes(m)) return res.writeHead(400, { 'content-type': 'text/plain' }).end(`moods: ${MOODS.join(', ')}\n`)
      set(m)
      return res.writeHead(204).end()
    }
    if (req.method !== 'GET') return res.writeHead(405, { allow: 'GET, POST' }).end()
    if (path === '/mood') return res.writeHead(200, { 'content-type': 'text/plain' }).end(mood)
    if (path === '/events') {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' })
      res.write(`data: ${mood}\n\n`)
      clients.add(res)
      req.on('close', () => clients.delete(res))
      return
    }
    const file = FILES[path]
    if (!file) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': file[1], 'cache-control': 'no-store' }).end(readFileSync(new URL(file[0], root)))
  })
  server.on('close', () => clearTimeout(timer))
  return { server, mood: () => mood }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createBuddy().server.listen(PORT, HOST, () => console.log(`Desk buddy: http://${HOST}:${PORT}  (Ctrl+C to stop)`))
}
