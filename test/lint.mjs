// The lint must fail on a network call or an outside import in the library.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const LINT = fileURLToPath(new URL('../scripts/lint.mjs', import.meta.url))

function lintOne(code) {
  const dir = mkdtempSync(join(tmpdir(), 'dm-lint-'))
  mkdirSync(join(dir, 'src'))
  writeFileSync(join(dir, 'src', 'a.mjs'), code)
  const r = spawnSync(process.execPath, [LINT, '--root', dir], { encoding: 'utf8' })
  rmSync(dir, { recursive: true })
  return r
}

test('clean code passes', () => assert.equal(lintOne("import { x } from './b.mjs'\nexport default () => x\n").status, 0))
test('a network call fails', () => assert.match(lintOne("export default () => fetch('/x')\n").stderr, /uses fetch/))
test('browser storage fails', () => assert.match(lintOne('export default () => localStorage.length\n').stderr, /browser storage/))
test('an outside import fails', () => assert.match(lintOne("import x from 'left-pad'\nexport default x\n").stderr, /only its own files/))
test('a syntax error fails', () => assert.match(lintOne('export default ( =>\n').stderr, /does not parse/))
test('a bare outside import fails', () => assert.match(lintOne("import 'https://cdn.example/x.mjs'\nexport default () => 0\n").stderr, /only its own files/))
test('a worker fails', () => assert.match(lintOne("export default () => new Worker('./w.mjs')\n").stderr, /uses workers/))
test('loading a script fails', () => assert.match(lintOne("export default () => document.createElement('script')\n").stderr, /script loading/))
