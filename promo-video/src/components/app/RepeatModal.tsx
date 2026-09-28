import { app, accent } from "../../theme";
import { uiFont } from "../../fonts";

interface RepeatModalProps {
  code: string;
  num: number;
  count: number;
  /** 0..1 appear progress */
  progress: number;
  /** 0..1 "+" button press */
  plusPress?: number;
  /** 0..1 save button press */
  savePress?: number;
  countPop?: number;
}

export const MODAL_TOP = 60;
export const MODAL_PLUS = { x: 288, y: MODAL_TOP + 53 + 24 + 28 };
export const MODAL_SAVE = { x: 108, y: MODAL_TOP + 53 + 24 + 56 + 16 + 22 };

const circleBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 16,
  border: `1px solid ${accent.orange}66`,
  background: `${accent.orange}1A`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: accent.orange,
  fontSize: 16,
  fontWeight: 700,
  boxSizing: "border-box",
};

// Mirrors the ScrollableModal used by StickerPanel for repeated stickers
export const RepeatModal: React.FC<RepeatModalProps> = ({
  code,
  num,
  count,
  progress,
  plusPress = 0,
  savePress = 0,
  countPop = 0,
}) => (
  <div style={{ position: "absolute", inset: 0, zIndex: 20, fontFamily: uiFont, pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", opacity: progress }} />
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        top: MODAL_TOP,
        bottom: 60,
        background: app.cardBg,
        borderRadius: 16,
        opacity: progress,
        translate: `0px ${(1 - progress) * 24}px`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 53,
          borderBottom: `1px solid ${app.borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: app.textPrimary }}>
          {code} #{num} · Figurita
        </div>
        <div style={{ fontSize: 18, color: app.textMuted }}>✕</div>
      </div>
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: `${accent.orange}1A`,
            border: `1px solid ${accent.orange}4D`,
            borderRadius: 12,
            padding: "0 16px",
            height: 56,
            boxSizing: "border-box",
            marginBottom: 8,
          }}
        >
          <div style={{ color: accent.orange, fontWeight: 600, fontSize: 14 }}>🔄 Repetidas</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={circleBtn}>−</div>
            <div
              style={{
                color: app.textPrimary,
                fontSize: 20,
                fontWeight: 700,
                minWidth: 24,
                textAlign: "center",
                scale: `${1 + countPop * 0.35}`,
              }}
            >
              {count}
            </div>
            <div style={{ ...circleBtn, scale: `${1 - plusPress * 0.12}`, background: `${accent.orange}${plusPress > 0.3 ? "33" : "1A"}` }}>
              +
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div
            style={{
              flex: 1,
              background: accent.blue,
              borderRadius: 8,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              scale: `${1 - savePress * 0.05}`,
              filter: `brightness(${1 - savePress * 0.12})`,
            }}
          >
            ✅ Guardar ({count} rep.)
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 8,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${accent.red}4D`,
              background: `${accent.red}1A`,
              color: accent.red,
              fontWeight: 600,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          >
            ✕ No tengo
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "8px 0", textAlign: "center", color: app.textMuted, fontSize: 14 }}>
          Cancelar
        </div>
      </div>
    </div>
  </div>
);
