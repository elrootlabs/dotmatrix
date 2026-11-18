#!/usr/bin/env node
// Elroot Dot Matrix lint. Exits 1 unless every script parses, and the library itself (src/) only
// imports its own files and uses no network, storage or code-loading API. That keeps the promise
// that an art makes no requests and sets nothing in the browser.
//
//   node scripts/lint.mjs [--root <dir>]
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd()

const FORBIDDEN = [
  [/\bfetch\s*\(/, 'fetch'],
  [/\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [/\bWebSocket\b/, 'WebSocket'],
  [/\bEventSource\b/, 'EventSource'],
  [/\bsendBeacon\b/, 'sendBeacon'],
  [/\bimport\s*\(/, 'dynamic import'],
  [/\beval\s*\(/, 'eval'],
  [/\bnew\s+Function\b/, 'new Function'],
  [/\bdocument\.cookie\b/, 'cookies'],
  [/\b(localStorage|sessionStorage|indexedDB)\b/, 'browser storage'],
  [/\b(Worker|SharedWorker|importScripts|serviceWorker)\b/, 'workers'],
  [/createElement\s*\(\s*['"`]script|\.src\s*=/, 'script loading'],
]

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(join(dir, d.name)) : d.name.endsWith('.mjs') ? [join(dir, d.name)] : []))

const problems = []
const scripts = ['src', 'scripts', 'test'].flatMap((d) => {
  try {
    return walk(join(root, d))
  } catch {
    return []
  }
})
for (const file of scripts) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
  } catch (e) {
    problems.push(`${file}: does not parse\n${String(e.stderr).trim()}`)
  }
}
for (const file of walk(join(root, 'src'))) {
  const text = readFileSync(file, 'utf8')
  for (const [re, name] of FORBIDDEN) if (re.test(text)) problems.push(`${file}: uses ${name}`)
  for (const m of text.matchAll(/^\s*(?:import|export)\b(?:[^'"\n]*from)?\s*['"]([^'"]+)['"]/gm))
    if (!m[1].startsWith('./') && !m[1].startsWith('../')) problems.push(`${file}: imports "${m[1]}" (only its own files)`)
}

if (problems.length) {
  console.error(`lint: ${problems.length} problem(s)\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(`lint: ${scripts.length} files parse; src uses no network, storage or code-loading API`)
