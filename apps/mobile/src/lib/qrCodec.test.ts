import { describe, it, expect } from 'vitest'
import {
  encodeQR,
  decodeQR,
  computeMatch,
  detectQRType,
  encodeTradeQR,
  decodeTradeQR,
  buildStickerList,
  CARD_CODES,
} from './qrCodec'
import type { CollectionMap } from '@mi-album-fifa/shared'

// ---------------------------------------------------------------------------
// Sticker list structure
// ---------------------------------------------------------------------------

describe('sticker list structure', () => {
  it('tiene 994 stickers en total', () => {
    const stickers = buildStickerList()
    expect(stickers.length).toBe(994)
  })

  it('FWC tiene stickers 0-19 (20 stickers)', () => {
    const stickers = buildStickerList()
    const fwc = stickers.filter((s) => s.country_code === 'FWC')
    expect(fwc.length).toBe(20)
    expect(fwc[0].number).toBe(0)
    expect(fwc[19].number).toBe(19)
  })

  it('CC tiene stickers 1-14 (14 stickers)', () => {
    const stickers = buildStickerList()
    const cc = stickers.filter((s) => s.country_code === 'CC')
    expect(cc.length).toBe(14)
    expect(cc[0].number).toBe(1)
    expect(cc[13].number).toBe(14)
  })

  it('cards normales tienen stickers 1-20 (20 stickers)', () => {
    const stickers = buildStickerList()
    const mex = stickers.filter((s) => s.country_code === 'MEX')
    expect(mex.length).toBe(20)
    expect(mex[0].number).toBe(1)
    expect(mex[19].number).toBe(20)

    const esp = stickers.filter((s) => s.country_code === 'ESP')
    expect(esp.length).toBe(20)
    expect(esp[0].number).toBe(1)
    expect(esp[19].number).toBe(20)
  })

  it('tiene 50 cards en el orden correcto', () => {
    expect(CARD_CODES.length).toBe(50)
    expect(CARD_CODES[0]).toBe('FWC')
    expect(CARD_CODES[48]).toBe('PAN')
    expect(CARD_CODES[49]).toBe('CC')
  })
})

// ---------------------------------------------------------------------------
// encodeQR / decodeQR roundtrip
// ---------------------------------------------------------------------------

describe('encodeQR / decodeQR', () => {
  it('roundtrip: encode → decode preserva la colección', () => {
    const collection: CollectionMap = {
      FWC: {
        0: { collected: true, repeated: 2 },
        5: { collected: true, repeated: 0 },
        10: { collected: true, repeated: 1 },
      },
      MEX: {
        1: { collected: true, repeated: 0 },
        15: { collected: true, repeated: 3 },
      },
      CC: {
        7: { collected: true, repeated: 1 },
      },
    }

    const qr = encodeQR(collection)
    const decoded = decodeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    // FWC 0: collected, repeated=2 → no está en missing, está en repeated con count=2
    expect(decoded.missing.has('FWC|0')).toBe(false)
    expect(decoded.repeated.get('FWC|0')).toBe(2)

    // FWC 5: collected, repeated=0 → no está en missing, no está en repeated
    expect(decoded.missing.has('FWC|5')).toBe(false)
    expect(decoded.repeated.has('FWC|5')).toBe(false)

    // FWC 10: collected, repeated=1 → no está en missing, está en repeated con count=1
    expect(decoded.missing.has('FWC|10')).toBe(false)
    expect(decoded.repeated.get('FWC|10')).toBe(1)

    // FWC 1: no collected → está en missing
    expect(decoded.missing.has('FWC|1')).toBe(true)

    // MEX 1: collected, repeated=0
    expect(decoded.missing.has('MEX|1')).toBe(false)
    expect(decoded.repeated.has('MEX|1')).toBe(false)

    // MEX 15: collected, repeated=3
    expect(decoded.missing.has('MEX|15')).toBe(false)
    expect(decoded.repeated.get('MEX|15')).toBe(3)

    // CC 7: collected, repeated=1
    expect(decoded.missing.has('CC|7')).toBe(false)
    expect(decoded.repeated.get('CC|7')).toBe(1)
  })

  it('colección vacía → todo en missing', () => {
    const collection: CollectionMap = {}
    const qr = encodeQR(collection)
    const decoded = decodeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    // Todos los 994 stickers deberían estar en missing
    expect(decoded.missing.size).toBe(994)
    expect(decoded.repeated.size).toBe(0)
  })

  it('colección completa → nada en missing', () => {
    const collection: CollectionMap = {}
    const stickers = buildStickerList()

    for (const sticker of stickers) {
      const code = sticker.country_code
      if (!collection[code]) collection[code] = {}
      collection[code][sticker.number] = { collected: true, repeated: 0 }
    }

    const qr = encodeQR(collection)
    const decoded = decodeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    expect(decoded.missing.size).toBe(0)
    expect(decoded.repeated.size).toBe(0)
  })

  it('usa orden LSB en los bits', () => {
    // Crear colección con solo FWC 0 collected
    const collection: CollectionMap = {
      FWC: {
        0: { collected: true, repeated: 0 },
      },
    }

    const qr = encodeQR(collection)
    const decoded = decodeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    // FWC 0 es el primer sticker (bit 0), no debería estar en missing
    expect(decoded.missing.has('FWC|0')).toBe(false)

    // FWC 1 (bit 1) debería estar en missing
    expect(decoded.missing.has('FWC|1')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// computeMatch
// ---------------------------------------------------------------------------

describe('computeMatch', () => {
  it('identifica correctamente qué pueden intercambiar', () => {
    // Mi colección: tengo FWC 0 (repeated=2), FWC 1 (repeated=0), no tengo FWC 2
    const myCollection: CollectionMap = {
      FWC: {
        0: { collected: true, repeated: 2 },
        1: { collected: true, repeated: 0 },
      },
    }

    // Otra colección: no tiene FWC 0, tiene FWC 2 con repeated=3
    const otherCollection = {
      missing: new Set(['FWC|0', 'FWC|3']),
      repeated: new Map([['FWC|2', 3]]),
    }

    const match = computeMatch(myCollection, otherCollection)

    // theyCanGive: ellos pueden darme FWC 2 (yo no lo tengo, ellos tienen repeated>0)
    expect(match.theyCanGive.length).toBe(1)
    expect(match.theyCanGive[0].key).toBe('FWC|2')
    expect(match.theyCanGive[0].count).toBe(3)

    // iCanGive: yo puedo darles FWC 0 (ellos no lo tienen, yo tengo repeated=2)
    expect(match.iCanGive.length).toBe(1)
    expect(match.iCanGive[0].key).toBe('FWC|0')
    expect(match.iCanGive[0].count).toBe(2)
  })

  it('no incluye stickers sin repetidas en iCanGive', () => {
    const myCollection: CollectionMap = {
      FWC: {
        0: { collected: true, repeated: 0 },
      },
    }

    const otherCollection = {
      missing: new Set(['FWC|0']),
      repeated: new Map(),
    }

    const match = computeMatch(myCollection, otherCollection)

    // No puedo dar FWC 0 porque no tengo repetidas
    expect(match.iCanGive.length).toBe(0)
  })

  it('solo incluye en theyCanGive stickers que yo no tengo', () => {
    const myCollection: CollectionMap = {
      FWC: {
        0: { collected: true, repeated: 0 }, // Yo tengo FWC|0
      },
    }

    const otherCollection = {
      missing: new Set(['FWC|1']), // Ellos necesitan FWC|1
      repeated: new Map([['FWC|0', 2]]), // Ellos tienen FWC|0 con 2 repetidas
    }

    const match = computeMatch(myCollection, otherCollection)

    // No pueden darme FWC|0 porque yo ya lo tengo
    expect(match.theyCanGive.find((s) => s.key === 'FWC|0')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// detectQRType
// ---------------------------------------------------------------------------

describe('detectQRType', () => {
  it('detecta QR de colección', () => {
    const collection: CollectionMap = { FWC: { 0: { collected: true, repeated: 0 } } }
    const qr = encodeQR(collection)
    expect(detectQRType(qr)).toBe('collection')
  })

  it('detecta QR de intercambio', () => {
    const tradeQR = encodeTradeQR(
      [{ key: 'FWC|0', code: 'FWC', number: 0, label: 'FWC 0' }],
      [{ key: 'FWC|1', code: 'FWC', number: 1, label: 'FWC 1' }]
    )
    expect(detectQRType(tradeQR)).toBe('trade')
  })

  it('retorna null para strings inválidos', () => {
    expect(detectQRType('random string')).toBeNull()
    expect(detectQRType('')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// encodeTradeQR / decodeTradeQR roundtrip
// ---------------------------------------------------------------------------

describe('encodeTradeQR / decodeTradeQR', () => {
  it('roundtrip: encode → decode preserva los stickers', () => {
    const giving = [
      { key: 'FWC|0', code: 'FWC', number: 0, label: 'FWC 0' },
      { key: 'MEX|1', code: 'MEX', number: 1, label: 'MEX 1' },
    ]
    const receiving = [
      { key: 'FWC|5', code: 'FWC', number: 5, label: 'FWC 5' },
      { key: 'CC|7', code: 'CC', number: 7, label: 'CC 7' },
    ]

    const qr = encodeTradeQR(giving, receiving)
    const decoded = decodeTradeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    expect(decoded.giving.length).toBe(2)
    expect(decoded.giving[0].key).toBe('FWC|0')
    expect(decoded.giving[1].key).toBe('MEX|1')

    expect(decoded.receiving.length).toBe(2)
    expect(decoded.receiving[0].key).toBe('FWC|5')
    expect(decoded.receiving[1].key).toBe('CC|7')
  })

  it('listas vacías → QR válido pero vacío', () => {
    const qr = encodeTradeQR([], [])
    const decoded = decodeTradeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    expect(decoded.giving.length).toBe(0)
    expect(decoded.receiving.length).toBe(0)
  })

  it('retorna null para QR inválido', () => {
    expect(decodeTradeQR('random')).toBeNull()
    expect(decodeTradeQR('⋋T^invalid')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Compatibilidad con formato externo
// ---------------------------------------------------------------------------

describe('compatibilidad con formato externo', () => {
  it('usa el mismo orden de bits (LSB) que externalQR', () => {
    // Este test verifica que el formato interno es compatible con el externo
    const collection: CollectionMap = {
      FWC: {
        0: { collected: true, repeated: 0 },
      },
    }

    const qr = encodeQR(collection)
    const decoded = decodeQR(qr)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    // FWC 0 es el bit 0, no debería estar en missing
    expect(decoded.missing.has('FWC|0')).toBe(false)

    // FWC 1 es el bit 1, debería estar en missing
    expect(decoded.missing.has('FWC|1')).toBe(true)
  })

  it('puede decodificar un QR externo real', () => {
    // Este es el mismo QR usado en externalQR.test.ts
    const externalQR =
      '⋋^H4sIAAAAAAAAA1v/y/7f/wECzAAZy9Z/fQAAAA==;' +
      'H4sIAAAAAAAAA2NgGEAAAKh0odt9AAAA;' +
      'H4sIAAAAAAAAAwMAAAAAAAAAAAA='

    const decoded = decodeQR(externalQR)

    expect(decoded).not.toBeNull()
    if (!decoded) return

    // FWC 4, 6, 8, 10 están collected (no están en missing)
    expect(decoded.missing.has('FWC|4')).toBe(false)
    expect(decoded.missing.has('FWC|6')).toBe(false)
    expect(decoded.missing.has('FWC|8')).toBe(false)
    expect(decoded.missing.has('FWC|10')).toBe(false)

    // FWC 0 está missing
    expect(decoded.missing.has('FWC|0')).toBe(true)

    // MEX 3, 4, 5 están collected
    expect(decoded.missing.has('MEX|3')).toBe(false)
    expect(decoded.missing.has('MEX|4')).toBe(false)
    expect(decoded.missing.has('MEX|5')).toBe(false)

    // MEX 1 está missing
    expect(decoded.missing.has('MEX|1')).toBe(true)
  })
})
