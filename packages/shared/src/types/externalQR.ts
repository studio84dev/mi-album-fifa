export interface StickerState {
  owned: number[]
  repeated: number[]
}

export type AlbumState = Record<string, StickerState>
