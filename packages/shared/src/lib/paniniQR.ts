import { gunzipSync } from 'fflate'
import type { AlbumState } from '../types/paniniQR'

const PREFIX = '⋋^'
const SEP = ';'

const CARD_CODES = [
  'FWC',
  'MEX',
  'RSA',
  'KOR',
  'CZE',
  'CAN',
  'BIH',
  'QAT',
  'SUI',
  'BRA',
  'MAR',
  'HAI',
  'SCO',
  'USA',
  'PAR',
  'AUS',
  'TUR',
  'GER',
  'CUW',
  'CIV',
  'ECU',
  'NED',
  'JPN',
  'SWE',
  'TUN',
  'BEL',
  'EGY',
  'IRN',
  'NZL',
  'ESP',
  'CPV',
  'KSA',
  'URU',
  'FRA',
  'SEN',
  'IRQ',
  'NOR',
  'ARG',
  'ALG',
  'AUT',
  'JOR',
  'POR',
  'COD',
  'UZB',
  'COL',
  'ENG',
  'CRO',
  'GHA',
  'PAN',
  'CC',
]

function stickersPerCard(code: string): number {
  return code === 'CC' ? 14 : 20
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function inflateBlock(b64: string): Uint8Array {
  const compressed = base64ToUint8(b64)
  return gunzipSync(compressed)
}

function buildIndexMap(): Map<number, { cardCode: string; stickerNumber: number }> {
  const map = new Map<number, { cardCode: string; stickerNumber: number }>()
  let bitIndex = 0

  for (const cardCode of CARD_CODES) {
    const count = stickersPerCard(cardCode)
    for (let stickerNumber = 1; stickerNumber <= count; stickerNumber++) {
      map.set(bitIndex, { cardCode, stickerNumber })
      bitIndex++
    }
  }

  return map
}

const indexMap = buildIndexMap()

function getBitValueLSB(bytes: Uint8Array, bitIndex: number): boolean {
  const byteIndex = Math.floor(bitIndex / 8)
  const bitOffset = bitIndex % 8
  if (byteIndex >= bytes.length) return false
  const mask = 1 << bitOffset
  return (bytes[byteIndex] & mask) !== 0
}

export function decodePaniniQR(qrText: string): AlbumState {
  try {
    let payload = qrText.trim()
    if (payload.startsWith(PREFIX)) {
      payload = payload.slice(PREFIX.length)
    }

    const parts = payload.split(SEP)
    if (parts.length < 2) {
      throw new Error('Invalid QR format: insufficient parts')
    }

    const part0Bytes = inflateBlock(parts[0])
    const part1Bytes = parts[1] ? inflateBlock(parts[1]) : new Uint8Array(0)
    const part2Bytes = parts[2] ? inflateBlock(parts[2]) : new Uint8Array(0)

    const result: AlbumState = {}

    for (const cardCode of CARD_CODES) {
      result[cardCode] = { owned: [], repeated: [] }
    }

    // Construir mapa de Part2: bitIndex -> repetidas
    // Part1 (LSB) indica qué stickers tienen repetidas
    // Part2 contiene los valores en orden de bitIndex de Part1
    const part2Map: Map<number, number> = new Map()
    let part2Index = 0
    for (let bitIndex = 0; bitIndex < 1000; bitIndex++) {
      const info = indexMap.get(bitIndex)
      if (!info) continue

      const hasRepetidas = getBitValueLSB(part1Bytes, bitIndex)
      if (hasRepetidas && part2Index < part2Bytes.length) {
        const value = part2Bytes[part2Index]
        part2Map.set(bitIndex, value - 1)
        part2Index++
      }
    }

    // Iterar Part0 para encontrar stickers pegados
    for (let bitIndex = 0; bitIndex < 1000; bitIndex++) {
      const info = indexMap.get(bitIndex)
      if (!info) continue

      const { cardCode, stickerNumber } = info
      const isBitSet = getBitValueLSB(part0Bytes, bitIndex)

      if (!isBitSet) {
        result[cardCode].owned.push(stickerNumber)
        const repeatedCount = part2Map.get(bitIndex) ?? 0
        result[cardCode].repeated.push(repeatedCount)
      }
    }

    return result
  } catch (error) {
    throw new Error(`Failed to decode Panini QR: ${error instanceof Error ? error.message : String(error)}`)
  }
}
