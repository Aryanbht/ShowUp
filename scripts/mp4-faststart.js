/**
 * mp4-faststart.js
 * Moves the moov atom to the front of the MP4 file so browsers can
 * start playing immediately without downloading the full file first.
 * Pure Node.js – no ffmpeg required.
 */

const fs = require('fs')
const path = require('path')

const SRC  = 'd:\\ShowUp\\gemini_generated_video_d2c6cac6.mp4'
const DEST = 'd:\\ShowUp\\showup\\public\\showup-demo.mp4'

// ── Read entire file ──────────────────────────────────────────────
const buf = fs.readFileSync(SRC)
console.log(`Input:  ${SRC}`)
console.log(`Size:   ${(buf.length / 1024 / 1024).toFixed(2)} MB`)

// ── Parse top-level atoms ─────────────────────────────────────────
function parseAtoms(buf) {
  const atoms = []
  let offset = 0
  while (offset < buf.length - 8) {
    let size = buf.readUInt32BE(offset)
    const type = buf.slice(offset + 4, offset + 8).toString('ascii')

    if (size === 0) {
      // Atom extends to EOF
      size = buf.length - offset
    } else if (size === 1) {
      // 64-bit extended size
      const hi = buf.readUInt32BE(offset + 8)
      const lo = buf.readUInt32BE(offset + 12)
      size = hi * 0x100000000 + lo
    }

    if (size < 8) {
      console.error(`Invalid atom size ${size} at offset ${offset}`)
      break
    }

    atoms.push({ type, offset, size })
    console.log(`  Atom: ${type}  offset=${offset}  size=${size}`)
    offset += size
  }
  return atoms
}

console.log('\n── Atom layout ──────────────────────────────')
const atoms = parseAtoms(buf)

// ── Check if already faststart ────────────────────────────────────
const moovIdx = atoms.findIndex(a => a.type === 'moov')
const mdatIdx = atoms.findIndex(a => a.type === 'mdat')

if (moovIdx === -1) {
  console.error('\n❌ No moov atom found – not a valid MP4?')
  process.exit(1)
}

if (moovIdx < mdatIdx || mdatIdx === -1) {
  console.log('\n✅ moov is already before mdat – file is already web-optimised.')
  // Still copy to dest in case it differs
  fs.copyFileSync(SRC, DEST)
  console.log(`Copied to ${DEST}`)
  process.exit(0)
}

console.log('\n⚠️  moov is AFTER mdat – applying faststart fix…')

// ── Patch stco / co64 offsets inside moov ────────────────────────
// When we move moov to the front the chunk offsets inside it change.
function patchOffsets(moovBuf, delta) {
  // We need to walk the moov tree looking for stco and co64 boxes
  function walkBox(b, start, end) {
    let i = start
    while (i < end - 8) {
      let sz = b.readUInt32BE(i)
      const tp = b.slice(i + 4, i + 8).toString('ascii')
      if (sz === 0) sz = end - i
      if (sz < 8) break

      if (tp === 'stco') {
        // stco: version(1) flags(3) entry_count(4) then 4-byte offsets
        const count = b.readUInt32BE(i + 12)
        for (let n = 0; n < count; n++) {
          const pos = i + 16 + n * 4
          const old = b.readUInt32BE(pos)
          b.writeUInt32BE(old + delta, pos)
        }
        console.log(`  Patched stco: ${count} entries, delta=${delta}`)
      } else if (tp === 'co64') {
        // co64: version(1) flags(3) entry_count(4) then 8-byte offsets
        const count = b.readUInt32BE(i + 12)
        for (let n = 0; n < count; n++) {
          const pos = i + 16 + n * 8
          // Only patch lo 32 bits for simplicity (files < 4GB)
          const old = b.readUInt32BE(pos + 4)
          b.writeUInt32BE(old + delta, pos + 4)
        }
        console.log(`  Patched co64: ${count} entries, delta=${delta}`)
      } else if (['moov','trak','mdia','minf','stbl'].includes(tp)) {
        // Container – recurse
        walkBox(b, i + 8, i + sz)
      }
      i += sz
    }
  }
  walkBox(moovBuf, 0, moovBuf.length)
}

const moovAtom = atoms[moovIdx]
const moovBuf  = Buffer.from(buf.slice(moovAtom.offset, moovAtom.offset + moovAtom.size))

// Calculate how many bytes moov shifts forward (it moves to just after ftyp)
const ftypAtom  = atoms.find(a => a.type === 'ftyp')
const insertAt  = ftypAtom ? ftypAtom.offset + ftypAtom.size : 0
// moov used to start at moovAtom.offset; it will now start at insertAt
const delta     = insertAt - moovAtom.offset   // negative = moved left = chunks shift right

// The chunk data (mdat etc.) doesn't move, but moov moved, so offsets relative
// to file start increase by (moovAtom.offset - insertAt) i.e. -delta
patchOffsets(moovBuf, -delta)

// ── Assemble the new file ─────────────────────────────────────────
const parts = []

// 1. Everything before the moov insertion point (ftyp etc.)
if (insertAt > 0) {
  parts.push(buf.slice(0, insertAt))
}

// 2. The patched moov atom
parts.push(moovBuf)

// 3. Everything between insertAt and the old moov (other atoms, mdat…)
//    … excluding the original moov
const beforeMoov = buf.slice(insertAt, moovAtom.offset)
const afterMoov  = buf.slice(moovAtom.offset + moovAtom.size)
parts.push(beforeMoov)
parts.push(afterMoov)

const outBuf = Buffer.concat(parts)
fs.writeFileSync(DEST, outBuf)

console.log(`\n✅ Done! Web-optimised file written to:`)
console.log(`   ${DEST}`)
console.log(`   Size: ${(outBuf.length / 1024 / 1024).toFixed(2)} MB`)
