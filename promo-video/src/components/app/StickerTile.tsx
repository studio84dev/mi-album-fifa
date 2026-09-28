import { interpolateColors } from "remotion";
import { app, accent } from "../../theme";
import { uiFont } from "../../fonts";

export interface TileVisual {
  /** 0..1, animates grey -> blue */
  collected: number;
  repeated: number;
  /** 0..1 marketing glow (hook only) */
  glow?: number;
  /** 0..1 finger press */
  press?: number;
  /** extra scale pop */
  pop?: number;
  badgeScale?: number;
}

interface StickerTileProps extends TileVisual {
  num: number;
  code: string;
  width: number;
}

// Mirrors apps/mobile/src/components/StickerCard.tsx
export const StickerTile: React.FC<StickerTileProps> = ({
  num,
  code,
  width,
  collected,
  repeated,
  glow = 0,
  press = 0,
  pop = 0,
  badgeScale = 1,
}) => {
  const isRep = repeated > 0;
  const bg = isRep && collected >= 1
    ? accent.blueHover
    : interpolateColors(collected, [0, 1], [app.bgTertiary, accent.blue]);
  const border = interpolateColors(collected, [0, 1], [app.borderColor, accent.blue]);
  const color = interpolateColors(collected, [0, 1], [app.textMuted, "#ffffff"]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height: width / 1.1,
        borderRadius: 6,
        background: bg,
        border: `1px solid ${border}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: uiFont,
        color,
        scale: `${1 - press * 0.07 + pop}`,
        boxShadow: glow > 0 ? `0 0 ${22 * glow}px ${3 * glow}px rgba(59,130,246,${0.75 * glow})` : "none",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, lineHeight: "16px" }}>{num}</div>
      <div style={{ fontSize: 9, fontWeight: 500, opacity: 0.75, marginTop: 1 }}>{code}</div>
      {isRep ? (
        <div
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            background: accent.orange,
            borderRadius: 3,
            padding: "0 2px",
            color: "#ffffff",
            fontSize: 8,
            fontWeight: 700,
            lineHeight: "11px",
            scale: `${badgeScale}`,
            transformOrigin: "100% 0%",
          }}
        >
          +{repeated}
        </div>
      ) : null}
    </div>
  );
};

// Grid geometry (StickerPanel: 16dp horizontal padding, 5 columns, 5dp gap)
export const TILE_W = Math.floor((360 - 32 - 20) / 5);
export const TILE_H = TILE_W / 1.1;
export const GRID_TOP = 30 + 61 + 16;

export const tileCenter = (num: number) => {
  const i = num - 1;
  const col = i % 5;
  const row = Math.floor(i / 5);
  return {
    x: 16 + col * (TILE_W + 5) + TILE_W / 2,
    y: GRID_TOP + row * (TILE_H + 5) + TILE_H / 2,
  };
};
