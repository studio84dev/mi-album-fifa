import { describe, it, expect } from 'vitest'
import { gzipSync } from 'fflate'
import { decodeExternalQR } from './externalQR'
import type { AlbumState } from '../types/externalQR'

// ---------------------------------------------------------------------------
// Helpers para construir QRs de prueba programáticamente
// ---------------------------------------------------------------------------

const CARD_CODES = [
  'FWC', 'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI', 'BRA',
  'MAR', 'HAI', 'SCO', 'USA', 'PAR', 'AUS', 'TUR', 'GER', 'CUW', 'CIV',
  'ECU', 'NED', 'JPN', 'SWE', 'TUN', 'BEL', 'EGY', 'IRN', 'NZL', 'ESP',
  'CPV', 'KSA', 'URU', 'FRA', 'SEN', 'IRQ', 'NOR', 'ARG', 'ALG', 'AUT',
  'JOR', 'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN', 'CC',
]

function stickersPerCard(code: string): number {
  return code === 'CC' ? 14 : 20
}

function buildCardBitOffset(cardCode: string): number {
  let offset = 0
  for (const code of CARD_CODES) {
    if (code === cardCode) return offset
    offset += stickersPerCard(code)
  }
  throw new Error(`Unknown card: ${cardCode}`)
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function deflateBlock(data: Uint8Array): string {
  return uint8ToBase64(gzipSync(data))
}

/**
 * Construye un QR texto a partir de un AlbumState.
 * Es la inversa de decodeExternalQR, útil para generar fixtures.
 */
function buildTestQR(state: AlbumState): string {
  const totalBits = 1000
  const byteCount = Math.ceil(totalBits / 8)

  // Part0: bit=0 → owned, bit=1 → not owned
  const part0 = new Uint8Array(byteCount)
  // Part1: bit=1 → has repeated
  const part1 = new Uint8Array(byteCount)
  // Part2: sequential bytes of (repeated + 1)
  const part2Values: number[] = []

  // Inicializar todos los bits de Part0 en 1 (nada owned por defecto)
  for (let i = 0; i < byteCount; i++) {
    part0[i] = 0xff
  }

  for (const cardCode of CARD_CODES) {
    const count = stickersPerCard(cardCode)
    const baseOffset = buildCardBitOffset(cardCode)
    const startNumber = cardCode === 'FWC' ? 0 : 1
    const entry = state[cardCode]

    for (let i = 0; i < count; i++) {
      const stickerNumber = startNumber + i
      const bitIndex = baseOffset + i
      const byteIdx = Math.floor(bitIndex / 8)
      const bitOffset = bitIndex % 8

      if (entry && entry.owned.includes(stickerNumber)) {
        // owned → clear bit in Part0 (bit=0 means owned)
        part0[byteIdx] &= ~(1 << bitOffset)

        const idx = entry.owned.indexOf(stickerNumber)
        const repeatedCount = entry.repeated[idx] ?? 0
        if (repeatedCount > 0) {
          // set bit in Part1
          part1[byteIdx] |= 1 << bitOffset
          part2Values.push(repeatedCount + 1)
        }
      }
    }
  }

  const part2 = new Uint8Array(part2Values)
  const b0 = deflateBlock(part0)
  const b1 = deflateBlock(part1)
  const b2 = deflateBlock(part2)

  return `⋋^${b0};${b1};${b2}`
}

// ---------------------------------------------------------------------------
// Fixture real (QR escaneado de un álbum Panini real)
// ---------------------------------------------------------------------------

const REAL_QR =
  '⋋^H4sIAAAAAAAAA/vxHAnsv/2fXBD//w/JepgByNcBPn0AAAA=;' +
  'H4sIAAAAAAAAA2NgGEAAAKh0odt9AAAA;' +
  'H4sIAAAAAAAAAwMAAAAAAAAAAAA='

const REAL_EXPECTED: AlbumState = {
  CAN: { owned: [1, 11, 15, 18], repeated: [0, 0, 0, 0] },
  CZE: { owned: [4, 5, 12, 13, 20], repeated: [0, 0, 0, 0, 0] },
  ESP: { owned: [2, 4, 13, 14], repeated: [0, 0, 0, 0] },
  FWC: { owned: [0, 1, 2, 11, 12, 19], repeated: [0, 0, 0, 0, 0, 0] },
  KOR: { owned: [1, 8, 9, 16, 17], repeated: [0, 0, 0, 0, 0] },
  MEX: { owned: [1, 8, 9, 16, 17], repeated: [0, 0, 0, 0, 0] },
  RSA: { owned: [4, 5, 12, 13, 20], repeated: [0, 0, 0, 0, 0] },
}

// ---------------------------------------------------------------------------
// Fixture real #2 (QR escaneado — FWC + MEX)
// ---------------------------------------------------------------------------

const REAL_QR_2 =
  '⋋^H4sIAAAAAAAAA1v/y/7f/wECzAAZy9Z/fQAAAA==;' +
  'H4sIAAAAAAAAA2NgGEAAAKh0odt9AAAA;' +
  'H4sIAAAAAAAAAwMAAAAAAAAAAAA='

const REAL_EXPECTED_2: AlbumState = {
  FWC: { owned: [4, 6, 8, 10], repeated: [0, 0, 0, 0] },
  MEX: { owned: [3, 4, 5], repeated: [0, 0, 0] },
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('decodeExternalQR', () => {
  it('decodifica un QR real escaneado (fixture)', () => {
    const result = decodeExternalQR(REAL_QR)
    expect(result).toEqual(REAL_EXPECTED)
  })

  it('decodifica QR real #2 (FWC + MEX)', () => {
    const result = decodeExternalQR(REAL_QR_2)
    expect(result).toEqual(REAL_EXPECTED_2)
  })

  it('funciona sin el prefijo ⋋^', () => {
    const withoutPrefix = REAL_QR.slice(2) // quitar ⋋^
    const result = decodeExternalQR(withoutPrefix)
    expect(result).toEqual(REAL_EXPECTED)
  })

  it('FWC usa stickers 0-19 (empieza en 0)', () => {
    const state: AlbumState = {
      FWC: { owned: [0, 5, 19], repeated: [0, 0, 0] },
    }
    const qr = buildTestQR(state)
    const result = decodeExternalQR(qr)
    expect(result.FWC.owned).toEqual([0, 5, 19])
  })

  it('CC usa stickers 1-14', () => {
    const state: AlbumState = {
      CC: { owned: [1, 7, 14], repeated: [0, 0, 0] },
    }
    const qr = buildTestQR(state)
    const result = decodeExternalQR(qr)
    expect(result.CC.owned).toEqual([1, 7, 14])
  })

  it('cards normales (MEX, ESP, etc.) usan stickers 1-20', () => {
    const state: AlbumState = {
      MEX: { owned: [1, 10, 20], repeated: [0, 0, 0] },
    }
    const qr = buildTestQR(state)
    const result = decodeExternalQR(qr)
    expect(result.MEX.owned).toEqual([1, 10, 20])
  })

  it('decodifica repetidas correctamente', () => {
    const state: AlbumState = {
      ESP: { owned: [2, 4, 13], repeated: [3, 0, 5] },
    }
    const qr = buildTestQR(state)
    const result = decodeExternalQR(qr)
    expect(result.ESP.owned).toEqual([2, 4, 13])
    expect(result.ESP.repeated).toEqual([3, 0, 5])
  })

  it('QR con todo en 1 en Part0 → álbum vacío', () => {
    // Construir un QR con Part0 = todo 0xFF (nada owned)
    const byteCount = Math.ceil(1000 / 8)
    const emptyPart0 = new Uint8Array(byteCount)
    for (let i = 0; i < byteCount; i++) emptyPart0[i] = 0xff
    const emptyPart1 = new Uint8Array(byteCount) // todo en 0 = sin repetidas
    const emptyPart2 = new Uint8Array(0)

    const b0 = deflateBlock(emptyPart0)
    const b1 = deflateBlock(emptyPart1)
    const b2 = deflateBlock(emptyPart2)
    const qr = `⋋^${b0};${b1};${b2}`

    const result = decodeExternalQR(qr)
    expect(result).toEqual({})
  })

  it('lanza error con QR inválido (menos de 2 partes)', () => {
    expect(() => decodeExternalQR('⋋^abc')).toThrow('Invalid QR format')
  })

  it('lanza error con datos gzip corruptos', () => {
    expect(() => decodeExternalQR('⋋^not-valid-base64;also-bad;worse')).toThrow()
  })

  it('cards vacías se omiten del resultado', () => {
    const state: AlbumState = {
      FWC: { owned: [0], repeated: [0] },
      // MEX no debería aparecer
    }
    const qr = buildTestQR(state)
    const result = decodeExternalQR(qr)
    expect(Object.keys(result)).toEqual(['FWC'])
    expect(result).not.toHaveProperty('MEX')
  })

  it('múltiples cards simultáneamente', () => {
    const state: AlbumState = {
      FWC: { owned: [0, 1, 2], repeated: [0, 0, 0] },
      MEX: { owned: [1, 20], repeated: [2, 0] },
      CAN: { owned: [11, 15, 18], repeated: [0, 0, 0] },
      ESP: { owned: [2, 4, 13, 14], repeated: [0, 0, 0, 0] },
      CC: { owned: [3, 10], repeated: [1, 0] },
    }
    const qr = buildTestQR(state)
    const result = decodeExternalQR(qr)
    expect(result).toEqual(state)
  })

  it('roundtrip: encode → decode preserva estado completo', () => {
    // Construir un estado más complejo y verificar roundtrip
    const original: AlbumState = {}
    for (const code of CARD_CODES) {
      const count = stickersPerCard(code)
      const start = code === 'FWC' ? 0 : 1
      // Pegar cada 3 stickers con repetidas variables
      const owned: number[] = []
      const repeated: number[] = []
      for (let i = 0; i < count; i += 3) {
        owned.push(start + i)
        repeated.push(i % 4) // 0, 1, 2, 3
      }
      original[code] = { owned, repeated }
    }

    const qr = buildTestQR(original)
    const decoded = decodeExternalQR(qr)
    expect(decoded).toEqual(original)
  })
})
