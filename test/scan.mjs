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
  // the account name is allowed only as a commit author, not in a file
  'company name outside the public phrases ': j('author e', 'lrootlabs <1+e', 'lrootlabs@users.noreply.github.com>'),
  'private host': j('https://stag', 'ing.', 'example.org'),
  'long hex id': j('0123456789abcdef', '0123456789abcdef'),
  // the pinned-action allowance holds only for a workflow step at the start of a line
  'long hex id ': j('see uses: a/b@', '0123456789abcdef'.repeat(2), '01234567'),
  'local path': j('/Us', 'ers/', 'someone/project'),
  'company number': j('U1', '2345KA2020PTC123456'), // made up, the shape of an Indian company number
}

for (const [rule, value] of Object.entries(PLANTED)) {
  test(`it fails on a planted ${rule}`, () => {
    const dir = tree({ 'README.md': `hello\n${value}\n` })
    const r = run(dir)
    assert.equal(r.status, 1, `${rule} was not caught`)
    assert.match(r.stderr, new RegExp(rule.trim()))
    rmSync(dir, { recursive: true })
  })
}

// a minimal GIF: header, a 1 x 1 screen, an optional comment block, then the end marker
const gif = (comment = '') =>
  Buffer.concat([
    Buffer.from('GIF89a'),
    Buffer.from([1, 0, 1, 0, 0, 0, 0]),
    comment ? Buffer.concat([Buffer.from([0x21, 0xfe, comment.length]), Buffer.from(comment), Buffer.from([0])]) : Buffer.alloc(0),
    Buffer.from([0x3b]),
  ])

test('the demo GIF passes; a secret in its metadata, a fake GIF or a large GIF fails', () => {
  const clean = tree({ 'media/demo.gif': gif() })
  assert.equal(run(clean).status, 0, run(clean).stderr)
  const secret = tree({ 'media/demo.gif': gif(PLANTED['GitHub token']) })
  assert.match(run(secret).stderr, /media\/demo\.gif:\d+: GitHub token/)
  const fake = tree({ 'media/demo.gif': 'hello' })
  assert.match(run(fake).stderr, /not a GIF/)
  const big = tree({ 'media/demo.gif': Buffer.concat([gif(), Buffer.alloc(3_000_001)]) })
  assert.match(run(big).stderr, /larger than 3000000/)
  const other = tree({ 'media/other.gif': gif() })
  assert.match(run(other).stderr, /not an expected file/)
  for (const d of [clean, secret, fake, big, other]) rmSync(d, { recursive: true })
})

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

test('--history finds a secret added and removed inside merge commits', () => {
  const dir = tree({ 'README.md': 'one\n' })
  const git = (...a) =>
    execFileSync('git', ['-C', dir, '-c', j('user.name=e', 'lrootlabs'), '-c', j('user.email=1+e', 'lrootlabs@users.noreply.github.com'), ...a])
  const side = (name, file) => {
    git('checkout', '-qb', name, 'main~0')
    writeFileSync(join(dir, file), `${name}\n`)
    git('add', '.')
    git('commit', '-qm', name)
    git('checkout', '-q', 'main')
  }
  // each merge changes README.md while resolving, so only the merge commits' own diffs show the secret
  const merge = (name, readme) => {
    git('merge', '-q', '--no-ff', '--no-commit', name)
    writeFileSync(join(dir, 'README.md'), readme)
    git('add', '.')
    git('commit', '-qm', `merge ${name}`)
  }
  git('init', '-q', '-b', 'main')
  git('add', '.')
  git('commit', '-qm', 'one')
  side('a', 'CONTRIBUTING.md')
  merge('a', `one\n${PLANTED['AWS key']}\n`)
  side('b', 'SECURITY.md')
  merge('b', 'one\n')
  assert.equal(run(dir).status, 0)
  assert.match(run(dir, '--history').stderr, /history:.*AWS key/)
  rmSync(dir, { recursive: true })
})
