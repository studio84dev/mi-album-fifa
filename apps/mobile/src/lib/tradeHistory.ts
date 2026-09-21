import type { TradeStickerRef } from './qrCodec'

const TRADE_HISTORY_STORAGE_PREFIX = 'mi-album-fifa.exchange-history:'

export interface TradeHistoryEntry {
  qrValue: string
  giving: TradeStickerRef[]
  receiving: TradeStickerRef[]
  createdAt: string
}

export function getTradeHistoryStorageKey(userId: string): string {
  return `${TRADE_HISTORY_STORAGE_PREFIX}${userId}`
}

export function serializeTradeHistory(entry: TradeHistoryEntry): string {
  return JSON.stringify(entry)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTradeStickerRef(value: unknown): value is TradeStickerRef {
  return (
    isRecord(value) &&
    typeof value.key === 'string' &&
    typeof value.code === 'string' &&
    typeof value.number === 'number' &&
    typeof value.label === 'string'
  )
}

export function parseTradeHistory(raw: string | null): TradeHistoryEntry | null {
  if (!raw) return null

  try {
    const value: unknown = JSON.parse(raw)
    if (
      !isRecord(value) ||
      typeof value.qrValue !== 'string' ||
      typeof value.createdAt !== 'string' ||
      !Array.isArray(value.giving) ||
      !Array.isArray(value.receiving) ||
      !value.giving.every(isTradeStickerRef) ||
      !value.receiving.every(isTradeStickerRef)
    ) {
      return null
    }

    return {
      qrValue: value.qrValue,
      giving: value.giving,
      receiving: value.receiving,
      createdAt: value.createdAt,
    }
  } catch {
    return null
  }
}
