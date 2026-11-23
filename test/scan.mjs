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
    // the report names the rule and the place, never the text: CI logs are public
    for (const part of [value, value.slice(0, 12), value.slice(-12)]) assert.ok(!r.stderr.includes(part), `${rule}: the report shows the text`)
    rmSync(dir, { recursive: true })
  })
}

// A minimal GIF the way the demo is built: header, a 1 x 1 screen with a 2-colour table, the loop
// block, then one frame (timing + image). `extra` goes just before the trailer; `tail` after it.
const B = (...a) => Buffer.from(a)
const LOOP = Buffer.concat([B(0x21, 0xff, 11), Buffer.from('NETSCAPE2.0'), B(3, 1, 0, 0, 0)])
const FRAME = B(0x21, 0xf9, 4, 0, 8, 0, 0, 0, 0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 0x44, 0x01, 0)
const gif = ({ extra = Buffer.alloc(0), tail = Buffer.alloc(0), loop = LOOP } = {}) =>
  Buffer.concat([Buffer.from('GIF89a'), B(1, 0, 1, 0, 0x80, 0, 0), B(0, 0, 0, 255, 255, 255), loop, FRAME, extra, B(0x3b), tail])
const text = (label, words) => Buffer.concat([B(0x21, label, words.length), Buffer.from(words), B(0)])

test('the demo GIF passes when it holds only frames', () => {
  const clean = tree({ 'media/demo.gif': gif() })
  assert.equal(run(clean).status, 0, run(clean).stderr)
  rmSync(clean, { recursive: true })
})

const BAD_GIFS = {
  'a comment block': gif({ extra: text(0xfe, PLANTED['GitHub token']) }),
  'a text or unknown extension block': gif({ extra: text(0x01, 'hello there') }),
  // the words split across sub-blocks, so no readable run is 6 characters long
  'an application block other than the loop setting': gif({
    extra: Buffer.concat([B(0x21, 0xff, 11), Buffer.from('XMP DataXMP'), B(4), Buffer.from('ab12'), B(4), Buffer.from('cd34'), B(0)]),
  }),
  'an application block other than the loop setting ': gif({ loop: Buffer.concat([LOOP.subarray(0, -1), B(5), Buffer.from('extra'), B(0)]) }),
  'bytes after the end of the GIF': gif({ tail: Buffer.from('hidden') }),
  'a GIF that ends early': gif().subarray(0, 30),
  'not a GIF': Buffer.from('hello'),
  'larger than 1000000': Buffer.concat([gif(), Buffer.alloc(1_000_001)]),
}
for (const [problem, bytes] of Object.entries(BAD_GIFS)) {
  test(`a demo GIF with ${problem.trim()} fails`, () => {
    const dir = tree({ 'media/demo.gif': bytes })
    const r = run(dir)
    assert.equal(r.status, 1, `${problem} was not caught`)
    assert.match(r.stderr, new RegExp(`media/demo\\.gif: ${problem.trim()}`))
    rmSync(dir, { recursive: true })
  })
}

test('the comment block secret is also caught by the text scan, and only demo.gif is allowed', () => {
  const secret = tree({ 'media/demo.gif': BAD_GIFS['a comment block'] })
  assert.match(run(secret).stderr, /media\/demo\.gif:\d+: GitHub token/)
  const other = tree({ 'media/other.gif': gif() })
  assert.match(run(other).stderr, /not an expected file/)
  for (const d of [secret, other]) rmSync(d, { recursive: true })
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
  assert.match(r.stderr, /history \(commit [0-9a-f]{7,}\): GitHub token/)
  assert.ok(!r.stderr.includes(PLANTED['GitHub token'].slice(0, 12)))
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
  assert.match(run(dir, '--history').stderr, /history \(commit [0-9a-f]{7,}\): AWS key/)
  rmSync(dir, { recursive: true })
})

test('--history fails on a personal address in commit details, without printing it', () => {
  const dir = tree({ 'README.md': 'one\n' })
  const address = j('someone.private', '@', 'example.com')
  execFileSync('git', ['-C', dir, 'init', '-q'])
  execFileSync('git', ['-C', dir, 'add', '.'])
  execFileSync('git', ['-C', dir, '-c', 'user.name=Someone', '-c', `user.email=${address}`, 'commit', '-qm', 'one'])
  const r = run(dir, '--history')
  assert.equal(r.status, 1)
  assert.match(r.stderr, /history \(commit [0-9a-f]{7,}\): email address/)
  assert.ok(!r.stderr.includes(address) && !r.stderr.includes('someone.private'), 'the report shows the address')
  rmSync(dir, { recursive: true })
})

test('history: the owner account passes under its username or display name, other names do not', () => {
  const email = j('272954373+e', 'lrootlabs@users.noreply.github.com')
  const commitAs = (name) => {
    const dir = tree({ 'README.md': '# Dot Matrix\n' })
    const git = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' })
    git('init', '-q')
    git('add', '-A')
    git('-c', `user.name=${name}`, '-c', `user.email=${email}`, 'commit', '-q', '-m', 'x')
    const r = run(dir, '--history')
    rmSync(dir, { recursive: true })
    return r.status
  }
  assert.equal(commitAs(j('e', 'lrootlabs')), 0)
  assert.equal(commitAs(j('E', 'lroot Labs - Team')), 0)
  assert.equal(commitAs(j('E', 'lroot Someone')), 1)
})

test("history: GitHub's merge subject 'Merge pull request #N from owner/branch' passes", () => {
  const email = j('272954373+e', 'lrootlabs@users.noreply.github.com')
  const dir = tree({ 'README.md': '# Dot Matrix\n' })
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' })
  git('init', '-q')
  git('add', '-A')
  git('-c', j('user.name=e', 'lrootlabs'), '-c', `user.email=${email}`, 'commit', '-q', '-m', j('Merge pull request #2 from e', 'lrootlabs/desk-buddy'))
  const ok = run(dir, '--history').status
  git('-c', j('user.name=e', 'lrootlabs'), '-c', `user.email=${email}`, 'commit', '-q', '--allow-empty', '-m', j('see e', 'lrootlabs internal notes'))
  const bad = run(dir, '--history').status
  rmSync(dir, { recursive: true })
  assert.equal(ok, 0)
  assert.equal(bad, 1)
})
