import type { ReactNode } from "react";
import { app, accent } from "../../theme";
import { uiFont } from "../../fonts";
import { Flag, SettingsFab, StatusBar, TabBar, STATUS_H } from "./Chrome";
import { StickerTile, TILE_W, type TileVisual } from "./StickerTile";

interface CountryScreenProps {
  code: string;
  name: string;
  iso: string;
  page: number;
  collectedCount: number;
  repeatedCount: number;
  tiles: TileVisual[];
  curiosity: { index: number; total: number; text: string };
  children?: ReactNode;
}

// Mirrors apps/mobile/app/country/[code].tsx + StickerPanel + CuriosityCarousel
export const CountryScreen: React.FC<CountryScreenProps> = ({
  code,
  name,
  iso,
  page,
  collectedCount,
  repeatedCount,
  tiles,
  curiosity,
  children,
}) => {
  const rows = [0, 1, 2, 3];
  return (
    <div style={{ position: "absolute", inset: 0, background: app.bgPrimary, fontFamily: uiFont }}>
      <StatusBar bg={app.bgPrimary} />
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: STATUS_H,
          left: 0,
          width: 360,
          height: 61,
          background: app.bgSecondary,
          borderBottom: `1px solid ${app.borderColor}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <div style={{ color: accent.blue, fontSize: 15, marginRight: 16, paddingLeft: 4 }}>← Volver</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <Flag iso={iso} width={28} height={20} />
          <div>
            <div style={{ color: app.textPrimary, fontWeight: 700, fontSize: 15 }}>{name}</div>
            <div style={{ color: app.textMuted, fontSize: 11 }}>Pág. {page}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: accent.blue }}>
            {collectedCount}
            <span style={{ color: app.textMuted, fontWeight: 500 }}>/{tiles.length}</span>
          </div>
          {repeatedCount > 0 ? (
            <div style={{ color: accent.orange, fontSize: 11, fontWeight: 600 }}>{repeatedCount}</div>
          ) : null}
        </div>
      </div>

      {/* Sticker grid */}
      <div
        style={{
          position: "absolute",
          top: STATUS_H + 61 + 16,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {rows.map((r) => (
          <div key={r} style={{ display: "flex", gap: 5 }}>
            {tiles.slice(r * 5, r * 5 + 5).map((t, c) => (
              <StickerTile key={c} num={r * 5 + c + 1} code={code} width={TILE_W} {...t} />
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 375,
          left: 16,
          right: 16,
          color: app.textDisabled,
          fontSize: 12,
          textAlign: "center",
          lineHeight: "16px",
        }}
      >
        Toca una figurita para marcarla · Mantén presionado para registrar repetidas
      </div>

      {/* Curiosity carousel */}
      {[-1, 0, 1].map((o) => (
        <div
          key={o}
          style={{
            position: "absolute",
            top: 440,
            left: 40 + o * 296,
            width: 280,
            height: 178,
            boxSizing: "border-box",
            background: app.bgTertiary,
            border: `1px solid ${app.borderColor}`,
            borderRadius: 12,
            padding: 16,
          }}
        >
          {o === 0 ? (
            <>
              <div
                style={{
                  color: app.textMuted,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                Curiosidad {curiosity.index}/{curiosity.total}
              </div>
              <div style={{ color: app.textSecondary, fontSize: 13, lineHeight: "20px" }}>{curiosity.text}</div>
            </>
          ) : null}
        </div>
      ))}
      <div style={{ position: "absolute", top: 634, left: 0, width: 360, display: "flex", justifyContent: "center", gap: 4 }}>
        {Array.from({ length: curiosity.total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: i === curiosity.index - 1 ? accent.blue : app.bgQuaternary,
            }}
          />
        ))}
      </div>

      <SettingsFab />
      <TabBar active="album" />
      {children}
    </div>
  );
};
