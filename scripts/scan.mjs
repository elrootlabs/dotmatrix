#!/usr/bin/env node
// Elroot Dot Matrix security scan. Exits 1 on anything that must never be in this repository:
// secrets, private details, or files outside the expected layout. It runs before every push
// (.githooks/pre-push), in CI, and on every export that writes this repository.
//
//   node scripts/scan.mjs [--root <dir>] [--history]
//
// --history also scans every commit (messages, authors and changes), not only the current files.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const args = process.argv.slice(2)
const root = args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd()

// Patterns are assembled at run time, so this file never matches its own rules.
const j = (...parts) => parts.join('')
const BRAND = j('elr', 'oot')

// The only places the company name may appear: its legal name (licence), the product name, and the
// public links to the library, the MCP server and this repository.
const BRAND_OK = [
  j('https://', BRAND, 'labs.com/opensource/dotmatrix'),
  j('https://', BRAND, 'labs.com/mcp'),
  j('github.com/', BRAND, 'labs/dotmatrix'),
  j('E', BRAND.slice(1), ' Labs (OPC) Private Limited'),
  j('E', BRAND.slice(1), ' Dot Matrix'),
  j('E', BRAND.slice(1), ' Labs'),
  j(BRAND, '-dotmatrix'),
]
// The GitHub account that owns this repository, exactly as git records it as an author or committer.
const OWNER = new RegExp(j('^(author|committer) ', BRAND, 'labs <\\d+\\+', BRAND, 'labs@users\\.noreply\\.github\\.com>$'), 'gm')
// Addresses that may appear in commit metadata: GitHub's private no-reply addresses.
const EMAIL_OK = [/@users\.noreply\.github\.com$/i, /^noreply@github\.com$/i, new RegExp(j('^nore', 'ply@anthr', 'opic\\.com$'), 'i')]

const RULES = [
  ['private key', new RegExp(j('-----BEGIN [A-Z ]*', 'PRIVATE KEY-----'))],
  ['GitHub token', new RegExp(j('\\b(gh[pousr]', '_[A-Za-z0-9]{30,}|github', '_pat_[A-Za-z0-9_]{20,})'))],
  ['AWS key', new RegExp(j('\\bA(KI|SI)', 'A[0-9A-Z]{16}\\b'))],
  ['Google key', new RegExp(j('\\bAI', 'za[0-9A-Za-z_-]{35}'))],
  ['Slack token', new RegExp(j('\\bxo', 'x[abprs]-[0-9A-Za-z-]{10,}'))],
  ['API key', new RegExp(j('\\bsk', '-(?:ant-|live_|test_|proj-)?[A-Za-z0-9_-]{20,}'))],
  ['JWT', new RegExp(j('\\beyJ[A-Za-z0-9_-]{10,}', '\\.eyJ[A-Za-z0-9_-]{10,}'))],
  ['captcha key', new RegExp(j('\\b0x', '4AAAA[A-Za-z0-9_-]{10,}'))],
  ['credential', new RegExp(j('(pass', 'word|sec', 'ret|tok', 'en|api[_-]?key)\\s*[:=]\\s*[\'"][^\'"\\s]{8,}'), 'i')],
  ['private host', new RegExp(j('(\\bstag', 'ing\\.|\\.wor', 'kers\\.dev|\\.pag', 'es\\.dev|clou', 'dflareaccess\\.com|\\blocal', 'host:\\d)'), 'i')],
  ['long hex id', /\b[0-9a-f]{32,}\b/i],
  ['UUID', /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i],
  ['local path', new RegExp(j('(/Us', 'ers/|/ho', 'me/[a-z]|[A-Z]:\\\\Us', 'ers)'))],
  ['company number', new RegExp(j('\\b[LU]\\d{5}[A-Z]{2}', '\\d{4}[A-Z]{3}\\d{6}\\b|\\b\\d{2}[A-Z]{5}\\d{4}', '[A-Z][1-9A-Z]Z[0-9A-Z]\\b'))],
]
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g

// Every file this repository may hold.
const LAYOUT = [
  /^(README|SECURITY|CONTRIBUTING)\.md$/,
  /^LICENSE$/,
  /^package\.json$/,
  /^catalog\.json$/,
  /^\.gitignore$/,
  /^\.githooks\/pre-push$/,
  /^\.github\/workflows\/ci\.yml$/,
  /^\.github\/dependabot\.yml$/,
  /^src\/(index|runtime|helpers)\.mjs$/,
  /^src\/arts\/[a-z0-9-]+\.mjs$/,
  /^scripts\/(scan|lint)\.mjs$/,
  /^test\/[a-z0-9-]+\.mjs$/,
  /^examples\/index\.html$/,
  /^media\/demo\.gif$/,
]
const MAX_BYTES = 200_000
const MAX_GIF_BYTES = 1_000_000
/** The readable text inside a binary file, a second look after gifProblems. */
const strings = (buf) => (buf.toString('latin1').match(/[\x20-\x7e]{6,}/g) ?? []).join('\n')

/**
 * A GIF may hold only frames: images, their timing, and the standard loop block, ending exactly at
 * the trailer. Comment, plain-text and other application blocks, or bytes after the end, could carry
 * text a text scan would miss, so any of them fails. That leaves pixels as the only content.
 */
function gifProblems(buf) {
  let i = 6
  const need = (n) => {
    if (i + n > buf.length) throw new Error('ends early')
  }
  const table = (flags) => {
    if (flags & 0x80) {
      const n = 3 * 2 ** ((flags & 7) + 1)
      need(n)
      i += n
    }
  }
  const exact = (bytes) => {
    need(bytes.length)
    const ok = buf.subarray(i, i + bytes.length).every((b, k) => bytes[k] === null || b === bytes[k])
    i += bytes.length
    return ok
  }
  try {
    if (!/^GIF8[79]a$/.test(buf.toString('latin1', 0, 6))) return ['not a GIF']
    need(7)
    const screen = buf[i + 4]
    i += 7
    table(screen)
    for (;;) {
      need(1)
      const block = buf[i++]
      if (block === 0x3b) return i === buf.length ? [] : ['bytes after the end of the GIF']
      if (block === 0x2c) {
        need(10)
        const image = buf[i + 8]
        i += 9
        table(image)
        i++ // LZW minimum code size
        for (let n; (need(1), (n = buf[i++])); ) {
          need(n)
          i += n
        }
      } else if (block === 0x21 && buf[i] === 0xf9) {
        i++
        if (!exact([4, null, null, null, null, 0])) return ['a frame timing block of the wrong size']
      } else if (block === 0x21 && buf[i] === 0xff) {
        i++
        const loop = [11, ...Buffer.from('NETSCAPE2.0'), 3, 1, null, null, 0]
        if (!exact(loop)) return ['an application block other than the loop setting']
      } else if (block === 0x21) return [buf[i] === 0xfe ? 'a comment block' : 'a text or unknown extension block']
      else return ['an unknown block']
    }
  } catch {
    return ['a GIF that ends early']
  }
}
// a workflow step pinned to an action's commit; also as a +/- line in a diff
const PINNED = /^([+ -]?\s*(?:-\s*)?uses:\s*[\w./-]+@)[0-9a-f]{40}(?=\s|$)/

/** Problems in one piece of text, as "where: rule". The history names the commit instead of a line. */
function scanText(text, where) {
  const found = []
  const lines = text.split('\n')
  let commit = ''
  lines.forEach((raw, i) => {
    if (where === 'history' && /^commit [0-9a-f]{7,12}$/.test(raw)) commit = raw.slice(7)
    const at = commit ? `history (commit ${commit})` : `${where}:${i + 1}`
    const line = raw.replace(PINNED, '$1') // a GitHub action pinned to its commit is not a secret
    for (const [name, re] of RULES) {
      const m = line.match(re)
      if (m) found.push(`${at}: ${name}`) // never the matched text: CI logs are public
    }
    if (line.includes('@')) for (const m of line.matchAll(EMAIL)) if (!EMAIL_OK.some((ok) => ok.test(m[0]))) found.push(`${at}: email address`)
    let rest = line
    for (const ok of BRAND_OK) rest = rest.split(ok).join('')
    if (rest.toLowerCase().includes(BRAND)) found.push(`${at}: company name outside the public phrases`)
  })
  return found
}

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    if (d.name === '.git') return []
    const p = join(dir, d.name)
    return d.isDirectory() ? files(p) : [p]
  })
}

const problems = []
let count = 0
for (const file of files(root)) {
  const rel = relative(root, file).split(sep).join('/')
  count++
  if (!LAYOUT.some((re) => re.test(rel))) {
    problems.push(`${rel}: not an expected file`)
    continue
  }
  const gif = rel.endsWith('.gif')
  const max = gif ? MAX_GIF_BYTES : MAX_BYTES
  if (statSync(file).size > max) {
    problems.push(`${rel}: larger than ${max} bytes`)
    continue
  }
  const buf = readFileSync(file)
  if (gif) problems.push(...gifProblems(buf).map((p) => `${rel}: ${p}`))
  problems.push(...scanText(gif ? strings(buf) : buf.toString('utf8'), rel))
}

if (args.includes('--history')) {
  // commit ids are left out of the text: they are 40 hex characters and would read as an id
  const log = execFileSync('git', ['-C', root, 'log', '--all', '-p', '-m', '--format=commit %h%nauthor %an <%ae>%ncommitter %cn <%ce>%n%n%B'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  problems.push(...scanText(log.replace(OWNER, '$1 (owner)'), 'history'))
}

if (problems.length) {
  console.error(`scan: ${problems.length} problem(s)\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(`scan: ${count} files clean${args.includes('--history') ? ', history clean' : ''}`)
