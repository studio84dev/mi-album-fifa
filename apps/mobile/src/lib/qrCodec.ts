import { gunzipSync, gzipSync } from 'fflate'
import { allStickers } from '@mi-album-fifa/shared'
import type { CollectionMap } from '@mi-album-fifa/shared'

const PREFIX = '⋋^'
const SEP = ';'

export interface OtherCollectionData {
  missing: Set<string>
  repeated: Map<string, number>
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function inflateBlock(b64: string): Uint8Array {
  const compressed = base64ToUint8(b64)
  return gunzipSync(compressed)
}

function deflateBlock(data: Uint8Array): string {
  const compressed = gzipSync(data)
  return uint8ToBase64(compressed)
}

const stickerList = allStickers.filter((s) => s.number != null)

function getStickerKey(countryCode: string | null, number: number): string {
  const code = countryCode ?? '00'
  return `${code}|${number}`
}

export function decodeQR(raw: string): OtherCollectionData | null {
  try {
    let payload = raw.trim()
    if (payload.startsWith(PREFIX)) {
      payload = payload.slice(PREFIX.length)
    }

    const parts = payload.split(SEP)
    if (parts.length < 2) return null

    const missingBytes = inflateBlock(parts[0])
    const repeatedBytes = parts[1] ? inflateBlock(parts[1]) : null
    const countBytes = parts[2] ? inflateBlock(parts[2]) : null

    const missing = new Set<string>()
    const repeated = new Map<string, number>()

    let repeatedIndex = 0

    stickerList.forEach((sticker, idx) => {
      const byteIdx = Math.floor(idx / 8)
      const bitIdx = 7 - (idx % 8)

      const key = getStickerKey(sticker.country_code, sticker.number!)

      if (missingBytes && byteIdx < missingBytes.length) {
        const bit = (missingBytes[byteIdx] >> bitIdx) & 1
        if (bit === 1) missing.add(key)
      }

      if (repeatedBytes && byteIdx < repeatedBytes.length) {
        const bit = (repeatedBytes[byteIdx] >> bitIdx) & 1
        if (bit === 1) {
          let count = 1
          if (countBytes && repeatedIndex < countBytes.length) {
            count = countBytes[repeatedIndex]
            repeatedIndex++
          }
          repeated.set(key, count)
        }
      }
    })

    return { missing, repeated }
  } catch {
    return null
  }
}

export function encodeQR(collection: CollectionMap): string {
  const totalStickers = stickerList.length
  const byteCount = Math.ceil(totalStickers / 8)

  const missingBits = new Uint8Array(byteCount)
  const repeatedBits = new Uint8Array(byteCount)
  const repeatedCounts: number[] = []

  stickerList.forEach((sticker, idx) => {
    const byteIdx = Math.floor(idx / 8)
    const bitIdx = 7 - (idx % 8)
    const code = sticker.country_code ?? 'null'
    const num = sticker.number!

    const entry = collection[code]?.[num]

    if (!entry?.collected) {
      missingBits[byteIdx] |= 1 << bitIdx
    }

    if ((entry?.repeated ?? 0) > 0) {
      repeatedBits[byteIdx] |= 1 << bitIdx
      repeatedCounts.push(entry!.repeated)
    }
  })

  const block1 = deflateBlock(missingBits)
  const block2 = deflateBlock(repeatedBits)
  const block3 = deflateBlock(new Uint8Array(repeatedCounts))

  return `${PREFIX}${block1}${SEP}${block2}${SEP}${block3}`
}

export interface MatchResult {
  theyCanGive: Array<{ key: string; code: string; number: number; label: string; count: number }>
  iCanGive: Array<{ key: string; code: string; number: number; label: string; count: number }>
}

export function computeMatch(myCollection: CollectionMap, other: OtherCollectionData): MatchResult {
  const theyCanGive: MatchResult['theyCanGive'] = []
  const iCanGive: MatchResult['iCanGive'] = []

  stickerList.forEach((sticker) => {
    const code = sticker.country_code ?? 'null'
    const num = sticker.number!
    const key = getStickerKey(sticker.country_code, num)
    const label = sticker.code

    const myEntry = myCollection[code]?.[num]
    const myCollected = myEntry?.collected ?? false
    const myRepeated = myEntry?.repeated ?? 0

    const theyMissing = other.missing.has(key)
    const theyRepeatedCount = other.repeated.get(key) ?? 0

    if (!myCollected && theyRepeatedCount > 0) {
      theyCanGive.push({ key, code, number: num, label, count: theyRepeatedCount })
    }

    if (!theyMissing && myRepeated > 0) {
      iCanGive.push({ key, code, number: num, label, count: myRepeated })
    }
  })

  return { theyCanGive, iCanGive }
}
