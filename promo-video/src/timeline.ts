// Mirrors the inline durations in AlbumFanPromo.tsx (frames @30fps). Total = 720 frames = 24s.
const SCENES = {
  hook: 150,
  repeats: 120,
  progress: 135,
  trade: 165,
  celebrate: 85,
  end: 123,
} as const;
const TRANSITION = 12;
const TRADE_TO_CELEBRATE = 10;

const start = {
  hook: 0,
  repeats: SCENES.hook - TRANSITION,
  progress: SCENES.hook + SCENES.repeats - TRANSITION * 2,
  trade: SCENES.hook + SCENES.repeats + SCENES.progress - TRANSITION * 3,
  celebrate: SCENES.hook + SCENES.repeats + SCENES.progress + SCENES.trade - TRANSITION * 3 - TRADE_TO_CELEBRATE,
};
const endStart = start.celebrate + SCENES.celebrate - TRANSITION;

export type SfxKind = "whoosh" | "tap" | "scan" | "success";

// Global frames for optional sound design, aligned with on-screen actions
export const SFX_CUES: { at: number; kind: SfxKind }[] = [
  { at: 60, kind: "whoosh" },
  { at: start.repeats, kind: "whoosh" },
  { at: start.repeats + 12, kind: "tap" },
  { at: start.repeats + 46, kind: "tap" },
  { at: start.repeats + 58, kind: "tap" },
  { at: start.repeats + 72, kind: "tap" },
  { at: start.progress, kind: "whoosh" },
  { at: start.trade, kind: "whoosh" },
  { at: start.trade + 50, kind: "scan" },
  { at: start.trade + 72, kind: "tap" },
  { at: start.trade + 98, kind: "tap" },
  { at: start.trade + 134, kind: "tap" },
  { at: start.celebrate + 8, kind: "success" },
  { at: endStart, kind: "whoosh" },
];
