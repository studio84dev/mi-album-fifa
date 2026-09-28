import { Img, staticFile } from "remotion";
import { app, accent } from "../../theme";
import { uiFont } from "../../fonts";
import { SettingsFab, StatusBar, TabBar, STATUS_H, TAB_TOP } from "./Chrome";

export interface TradeChip {
  label: string;
  count: number;
}

// Real match from the screen recording
export const THEY_GIVE: TradeChip[] = [
  { label: "MEX 4", count: 3 },
  { label: "MEX 5", count: 2 },
  { label: "MEX 7", count: 2 },
  { label: "RSA 4", count: 3 },
  { label: "RSA 12", count: 4 },
  { label: "RSA 14", count: 3 },
];
export const I_GIVE: TradeChip[] = [
  { label: "MEX 2", count: 3 },
  { label: "MEX 10", count: 3 },
  { label: "MEX 18", count: 3 },
  { label: "RSA 7", count: 3 },
  { label: "RSA 10", count: 2 },
  { label: "RSA 18", count: 2 },
];

const Header: React.FC<{ link?: boolean; dark?: boolean }> = ({ link = true, dark = false }) => (
  <div
    style={{
      position: "absolute",
      top: STATUS_H,
      left: 0,
      width: 360,
      height: 49,
      boxSizing: "border-box",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.08)" : app.borderColor}`,
      background: dark ? "#0b0b0c" : app.bgPrimary,
      zIndex: 4,
    }}
  >
    <div style={{ color: dark ? "#f8fafc" : app.textPrimary, fontWeight: 700, fontSize: 18 }}>Intercambio</div>
    {link ? <div style={{ color: accent.blue, fontSize: 14 }}>Escanear otro QR</div> : null}
  </div>
);

interface ChipProps extends TradeChip {
  /** 0..1 selection */
  selected: number;
  accentColor: string;
}

// Mirrors StickerChip in apps/mobile/app/(tabs)/exchange.tsx
const Chip: React.FC<ChipProps> = ({ label, count, selected, accentColor }) => {
  const on = selected >= 0.5;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        borderRadius: 20,
        border: `1.5px solid ${on ? accentColor : app.borderColor}`,
        background: on ? `${accentColor}22` : app.bgTertiary,
        margin: 3,
        scale: `${1 + Math.sin(Math.min(1, selected) * Math.PI) * 0.12}`,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: on ? 700 : 400, color: on ? accentColor : app.textMuted }}>{label}</span>
      {count > 1 ? (
        <span
          style={{
            background: on ? accentColor : app.textDisabled,
            borderRadius: 99,
            minWidth: 16,
            height: 16,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
            boxSizing: "border-box",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      ) : null}
    </div>
  );
};

interface SectionProps {
  title: string;
  items: TradeChip[];
  selection: number[];
  accentColor: string;
}

const Section: React.FC<SectionProps> = ({ title, items, selection, accentColor }) => {
  const sel = selection.filter((s) => s >= 0.5).length;
  const all = sel === items.length;
  return (
    <div
      style={{
        background: app.bgSecondary,
        borderRadius: 12,
        border: `1px solid ${app.borderColor}`,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: `1px solid ${app.borderColor}`,
          background: `${accentColor}11`,
        }}
      >
        <div>
          <div style={{ color: app.textPrimary, fontWeight: 700, fontSize: 14 }}>{title}</div>
          <div style={{ color: app.textMuted, fontSize: 12, marginTop: 2 }}>
            {sel} / {items.length} seleccionados
          </div>
        </div>
        <div
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: `1px solid ${accentColor}`,
            background: `${accentColor}15`,
            color: accentColor,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {all ? "Deseleccionar todos" : "Seleccionar todos"}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", padding: 10 }}>
        {items.map((it, i) => (
          <Chip key={it.label} {...it} selected={selection[i] ?? 0} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
};

interface MatchScreenProps {
  theySel: number[];
  iSel: number[];
  confirmPress?: number;
}

export const CONFIRM_BTN = { x: 180, y: TAB_TOP - 16 - 25 };

export const ExchangeMatchScreen: React.FC<MatchScreenProps> = ({ theySel, iSel, confirmPress = 0 }) => {
  const nThey = theySel.filter((s) => s >= 0.5).length;
  const nI = iSel.filter((s) => s >= 0.5).length;
  const can = nThey > 0 && nI > 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: app.bgPrimary, fontFamily: uiFont }}>
      <StatusBar />
      <Header />
      <div style={{ position: "absolute", top: STATUS_H + 49 + 16, left: 16, right: 16 }}>
        <Section title="Él/Ella me puede dar" items={THEY_GIVE} selection={theySel} accentColor={accent.blue} />
        <Section title="Yo le puedo dar" items={I_GIVE} selection={iSel} accentColor={accent.orange} />
      </div>
      <SettingsFab top={560} />
      {/* Footer */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 360,
          bottom: 800 - TAB_TOP,
          padding: 16,
          boxSizing: "border-box",
          background: app.bgPrimary,
          borderTop: `1px solid ${app.borderColor}`,
        }}
      >
        {!can ? (
          <div style={{ color: app.textMuted, fontSize: 12, textAlign: "center", marginBottom: 10, lineHeight: "16px" }}>
            Selecciona al menos una figurita de cada sección para continuar.
          </div>
        ) : null}
        <div
          style={{
            height: 50,
            borderRadius: 12,
            background: can ? accent.blue : app.bgTertiary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: can ? "#ffffff" : app.textDisabled,
            fontWeight: 700,
            fontSize: 16,
            scale: `${1 - confirmPress * 0.04}`,
            filter: `brightness(${1 - confirmPress * 0.12})`,
            boxShadow: can ? "0 8px 20px rgba(59,130,246,0.28)" : "none",
          }}
        >
          Confirmar intercambio ({nI} → {nThey})
        </div>
      </div>
      <TabBar active="exchange" />
    </div>
  );
};

interface ScannerScreenProps {
  /** 0..1 laser position */
  laser: number;
  /** 0..1 QR lock-on */
  lock: number;
}

// Camera view shown while scanning ("Apunta la cámara al código QR")
export const ScannerScreen: React.FC<ScannerScreenProps> = ({ laser, lock }) => (
  <div style={{ position: "absolute", inset: 0, background: "#000", fontFamily: uiFont }}>
    <StatusBar bg="#000" dark />
    <Header link={false} dark />
    {/* Camera feed: the other phone's QR, slightly out of focus */}
    <div
      style={{
        position: "absolute",
        top: 79,
        left: 0,
        width: 360,
        height: TAB_TOP - 79,
        background: "radial-gradient(ellipse at 50% 45%, #2a2d33 0%, #111214 60%, #050506 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 150,
          width: 240,
          height: 240,
          borderRadius: 8,
          overflow: "hidden",
          filter: `blur(${(1 - lock) * 2.5}px) brightness(0.92)`,
          rotate: `${(1 - lock) * -4}deg`,
          scale: `${0.94 + lock * 0.06}`,
          boxShadow: "0 0 0 10px #ffffff",
        }}
      >
        <Img
          src={staticFile("screens/qr-modal.png")}
          style={{ position: "absolute", width: 392, height: 872, left: -76, top: -251, maxWidth: "none" }}
        />
      </div>
      {/* Viewfinder corners */}
      {[
        { l: 44, t: 134, r: 0 },
        { l: 276, t: 134, r: 90 },
        { l: 276, t: 366, r: 180 },
        { l: 44, t: 366, r: 270 },
      ].map((c) => (
        <div
          key={c.r}
          style={{
            position: "absolute",
            left: c.l,
            top: c.t,
            width: 40,
            height: 40,
            borderTop: `4px solid ${lock > 0.9 ? accent.green : "#ffffff"}`,
            borderLeft: `4px solid ${lock > 0.9 ? accent.green : "#ffffff"}`,
            borderTopLeftRadius: 10,
            rotate: `${c.r}deg`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 56,
          width: 248,
          top: 146 + laser * 236,
          height: 3,
          borderRadius: 2,
          background: accent.blue,
          boxShadow: `0 0 16px 4px ${accent.blue}`,
          opacity: 1 - lock,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 24,
          background: "rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
      >
        <div style={{ color: "#fff", fontSize: 15 }}>Apunta la cámara al código QR</div>
        <div style={{ marginTop: 16, color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Cancelar</div>
      </div>
    </div>
    <TabBar active="exchange" />
  </div>
);

interface SuccessScreenProps {
  emoji: number;
  title: number;
  desc: number;
  button: number;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ emoji, title, desc, button }) => (
  <div style={{ position: "absolute", inset: 0, background: app.bgPrimary, fontFamily: uiFont }}>
    <StatusBar />
    <Header link={false} />
    <div
      style={{
        position: "absolute",
        top: 79,
        height: TAB_TOP - 79,
        left: 0,
        width: 360,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        boxSizing: "border-box",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 56, lineHeight: "64px", scale: `${emoji}`, rotate: `${(1 - Math.min(1, emoji)) * -25}deg` }}>
        🎉
      </div>
      <div
        style={{
          color: app.textPrimary,
          fontWeight: 700,
          fontSize: 22,
          textAlign: "center",
          opacity: title,
          translate: `0px ${(1 - title) * 12}px`,
        }}
      >
        ¡Intercambio realizado!
      </div>
      <div
        style={{
          color: app.textSecondary,
          fontSize: 15,
          textAlign: "center",
          opacity: desc,
          translate: `0px ${(1 - desc) * 12}px`,
        }}
      >
        Diste 6 figurita(s) y recibiste 6 figurita(s).
      </div>
      <div
        style={{
          background: accent.orange,
          borderRadius: 12,
          padding: "14px 32px",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16,
          opacity: button,
          scale: `${0.9 + button * 0.1}`,
        }}
      >
        Volver al inicio
      </div>
    </div>
    <SettingsFab top={600} />
    <TabBar active="exchange" />
  </div>
);
