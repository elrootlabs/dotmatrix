// The security scan must fail on each kind of thing it guards against, and pass a clean tree.
// Planted values are assembled at run time, so this file never trips the scan itself.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const SCAN = fileURLToPath(new URL('../scripts/scan.mjs', import.meta.url))
const j = (...p) => p.join('')
const run = (dir, ...flags) => spawnSync(process.execPath, [SCAN, '--root', dir, ...flags], { encoding: 'utf8' })

function tree(files) {
  const dir = mkdtempSync(join(tmpdir(), 'dm-scan-'))
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true })
    writeFileSync(join(dir, name), text)
  }
  return dir
}

test('a clean tree passes', () => {
  const dir = tree({
    'README.md': j('# E', 'lroot Dot Matrix\n\nhttps://e', 'lrootlabs.com/opensource/dotmatrix\n'),
    'src/arts/a.mjs': 'export default () => 0\n',
    // an action pinned to its commit passes; the same hex anywhere else is a long hex id
    '.github/workflows/ci.yml': j('      - uses: actions/checkout@', '0123456789abcdef'.repeat(2), '01234567 # v1\n'),
  })
  assert.equal(run(dir).status, 0, run(dir).stderr)
  rmSync(dir, { recursive: true })
})

const PLANTED = {
  'private key': j('-----BEGIN RSA ', 'PRIVATE KEY-----'),
  'GitHub token': j('gh', 'p_', 'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8'),
  'AWS key': j('AK', 'IA', 'ABCDEFGHIJKLMNOP'),
  'API key': j('s', 'k-', 'live_', 'abcdefghijklmnopqrstuvwx'),
  'JWT': j('ey', 'JhbGciOiJIUzI1', '.ey', 'JzdWIiOiIxMjM0'),
  'captcha key': j('0x', '4AAAAAAB', 'cdefghijklmn'),
  credential: j('pass', 'word = "hunter2hunter2"'),
  'email address': j('someone', '@', 'example.com'),
  'company name outside the public phrases': j('see the e', 'lroot ', 'admin panel'),
  'private host': j('https://stag', 'ing.', 'example.org'),
  'long hex id': j('0123456789abcdef', '0123456789abcdef'),
  'local path': j('/Us', 'ers/', 'someone/project'),
  'company number': j('U1', '2345KA2020PTC123456'), // made up, the shape of an Indian company number
}

for (const [rule, value] of Object.entries(PLANTED)) {
  test(`it fails on a planted ${rule}`, () => {
    const dir = tree({ 'README.md': `hello\n${value}\n` })
    const r = run(dir)
    assert.equal(r.status, 1, `${rule} was not caught`)
    assert.match(r.stderr, new RegExp(rule))
    rmSync(dir, { recursive: true })
  })
}

test('it fails on a file outside the layout, and on a large file', () => {
  const dir = tree({ 'notes.txt': 'x', 'README.md': 'x'.repeat(200_001) })
  const r = run(dir)
  assert.equal(r.status, 1)
  assert.match(r.stderr, /notes\.txt: not an expected file/)
  assert.match(r.stderr, /larger than/)
  rmSync(dir, { recursive: true })
})

test('--history finds a secret that was committed and later removed', () => {
  const dir = tree({ 'README.md': `hello\n${PLANTED['GitHub token']}\n` })
  // committed as the account that owns the repository, through its no-reply address
  const git = (...a) =>
    execFileSync('git', ['-C', dir, '-c', j('user.name=e', 'lrootlabs'), '-c', j('user.email=1+e', 'lrootlabs@users.noreply.github.com'), ...a])
  git('init', '-q')
  git('add', '.')
  git('commit', '-qm', 'one')
  writeFileSync(join(dir, 'README.md'), 'hello\n')
  git('commit', '-qam', 'two')
  assert.equal(run(dir).status, 0)
  const r = run(dir, '--history')
  assert.equal(r.status, 1)
  assert.match(r.stderr, /history:.*GitHub token/)
  assert.doesNotMatch(r.stderr, /company name|email/)
  rmSync(dir, { recursive: true })
})
