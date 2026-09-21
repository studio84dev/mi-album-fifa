import { describe, expect, it } from 'vitest'
import {
  getTradeHistoryStorageKey,
  parseTradeHistory,
  serializeTradeHistory,
  type TradeHistoryEntry,
} from './tradeHistory'

const entry: TradeHistoryEntry = {
  qrValue: '⋋T^qr-value',
  giving: [{ key: 'ARG-1', code: 'ARG', number: 1, label: 'ARG 1' }],
  receiving: [{ key: 'BRA-2', code: 'BRA', number: 2, label: 'BRA 2' }],
  createdAt: '2026-09-21T12:00:00.000Z',
}

describe('trade history', () => {
  it('serializes and parses the last trade', () => {
    expect(parseTradeHistory(serializeTradeHistory(entry))).toEqual(entry)
  })

  it('rejects malformed or incomplete history', () => {
    expect(parseTradeHistory(null)).toBeNull()
    expect(parseTradeHistory('{"qrValue":"qr"}')).toBeNull()
    expect(parseTradeHistory('not-json')).toBeNull()
  })

  it('names storage independently for each user', () => {
    expect(getTradeHistoryStorageKey('user-a')).not.toBe(getTradeHistoryStorageKey('user-b'))
  })
})
