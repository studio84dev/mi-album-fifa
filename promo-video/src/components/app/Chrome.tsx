import { Img, staticFile } from "remotion";
import { app, accent } from "../../theme";
import { uiFont } from "../../fonts";

export const STATUS_H = 30;
export const TAB_TOP = 703;

interface StatusBarProps {
  bg?: string;
  dark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ bg = app.bgPrimary, dark = false }) => {
  const c = dark ? "#f8fafc" : "#111827";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 360,
        height: STATUS_H,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        boxSizing: "border-box",
        fontFamily: uiFont,
        color: c,
        fontSize: 13,
        fontWeight: 500,
        zIndex: 5,
      }}
    >
      <span>0:40</span>
      <svg width={70} height={12} viewBox="0 0 70 12">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 4} y={9 - i * 2.5} width={2.6} height={3 + i * 2.5} rx={0.6} fill={c} />
        ))}
        <path
          d="M24 4.2a8.5 8.5 0 0 1 11.5 0M26.2 6.6a5.3 5.3 0 0 1 7.1 0M28.4 9a2.1 2.1 0 0 1 2.7 0"
          stroke={c}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        <rect x={42} y={1.5} width={23} height={9} rx={2.4} stroke={c} strokeWidth={1.1} fill="none" />
        <rect x={65.6} y={4.3} width={1.6} height={3.4} rx={0.6} fill={c} />
        <text x={53.5} y={8.8} fontSize={6.6} fontWeight={700} textAnchor="middle" fill={c} fontFamily={uiFont}>
          100
        </text>
      </svg>
    </div>
  );
};

interface TabBarProps {
  active: "album" | "exchange";
}

export const TabBar: React.FC<TabBarProps> = ({ active }) => {
  const on = accent.blue;
  const off = app.textDisabled;
  const albumColor = active === "album" ? on : off;
  const exchangeColor = active === "exchange" ? on : off;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: TAB_TOP,
          width: 360,
          height: 62,
          background: "#ffffff",
          borderTop: `1px solid ${app.borderColor}`,
          display: "flex",
          fontFamily: uiFont,
          fontSize: 11,
          fontWeight: 600,
          boxSizing: "border-box",
          paddingTop: 8,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: albumColor }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <rect x={3} y={3} width={18} height={18} rx={2} stroke={albumColor} strokeWidth={2} />
            <path d="M3 9h18M9 9v12" stroke={albumColor} strokeWidth={2} strokeLinecap="round" />
          </svg>
          Álbum
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: exchangeColor }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <rect x={3} y={3} width={7} height={7} rx={1} stroke={exchangeColor} strokeWidth={2} />
            <rect x={14} y={3} width={7} height={7} rx={1} stroke={exchangeColor} strokeWidth={2} />
            <rect x={3} y={14} width={7} height={7} rx={1} stroke={exchangeColor} strokeWidth={2} />
            <path
              d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h3"
              stroke={exchangeColor}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
          Intercambio
        </div>
      </div>
      {/* Android gesture/nav area */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: TAB_TOP + 62,
          width: 360,
          height: 800 - TAB_TOP - 62,
          background: "#ffffff",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 70px",
          boxSizing: "border-box",
        }}
      >
        <svg width={12} height={12} viewBox="0 0 12 12">
          <path d="M10 1 2 6l8 5z" fill="none" stroke="#e5e7eb" strokeWidth={1.4} />
        </svg>
        <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1.4px solid #e5e7eb" }} />
        <div style={{ width: 11, height: 11, borderRadius: 2, border: "1.4px solid #e5e7eb" }} />
      </div>
    </>
  );
};

export const SettingsFab: React.FC<{ top?: number }> = ({ top = 604 }) => (
  <div
    style={{
      position: "absolute",
      right: 6,
      top,
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: "rgba(203,213,225,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 3,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "#a3a3a3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="#ffffff">
        <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.3 7.3 0 0 0 1.7 1L11 21h4l.4-2.9a7.3 7.3 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
      </svg>
    </div>
  </div>
);

export const Flag: React.FC<{ iso: string; width: number; height: number; radius?: number }> = ({
  iso,
  width,
  height,
  radius = 2,
}) => (
  <Img
    src={staticFile(`flags/${iso}.svg`)}
    style={{ width, height, borderRadius: radius, objectFit: "cover", display: "block" }}
  />
);

/** A real screenshot from the screen recording (1080x2400) rendered at dp scale */
export const ScreenImage: React.FC<{ src: string; coverStatusBar?: string }> = ({ src, coverStatusBar }) => (
  <>
    <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: 360, height: 800 }} />
    {coverStatusBar ? <StatusBar bg={coverStatusBar} /> : null}
  </>
);

interface TapIndicatorProps {
  x: number;
  y: number;
  /** 0..1 visibility */
  visible: number;
  /** 0..1 press depth (ring shrink + fill) */
  press: number;
  /** 0..1 long-press progress ring */
  hold?: number;
}

export const TapIndicator: React.FC<TapIndicatorProps> = ({ x, y, visible, press, hold = 0 }) => {
  const size = 44;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity: visible,
        scale: `${1.25 - press * 0.3 + (1 - visible) * 0.4}`,
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `rgba(255,255,255,${0.35 + press * 0.3})`,
          border: "2px solid rgba(255,255,255,0.95)",
          boxShadow: "0 4px 18px rgba(15,23,42,0.35)",
        }}
      />
      {hold > 0 ? (
        <svg width={size + 16} height={size + 16} style={{ position: "absolute", left: -8, top: -8 }}>
          <circle
            cx={(size + 16) / 2}
            cy={(size + 16) / 2}
            r={(size + 10) / 2}
            fill="none"
            stroke={accent.orange}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={Math.PI * (size + 10)}
            strokeDashoffset={Math.PI * (size + 10) * (1 - hold)}
            transform={`rotate(-90 ${(size + 16) / 2} ${(size + 16) / 2})`}
          />
        </svg>
      ) : null}
    </div>
  );
};
