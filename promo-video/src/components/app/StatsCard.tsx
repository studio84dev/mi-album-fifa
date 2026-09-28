import { app, accent } from "../../theme";
import { uiFont } from "../../fonts";

interface StatsCardProps {
  /** Progress bar fill (0..100) */
  pct: number;
  collected: number;
  total: number;
  missing: number;
  repeated: number;
  width?: number;
}

const label: React.CSSProperties = {
  fontSize: 10,
  color: app.textMuted,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginTop: 2,
};

const cell: React.CSSProperties = {
  flex: 1,
  minWidth: "33.33%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "4px 2px",
  boxSizing: "border-box",
};

// Mirrors GlobalStatsBar (compact) inside the UserMenu card
export const StatsCard: React.FC<StatsCardProps> = ({ pct, collected, total, missing, repeated, width = 296 }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      background: app.cardBg,
      borderRadius: 16,
      border: `1px solid ${app.borderColor}`,
      padding: 16,
      fontFamily: uiFont,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: app.textPrimary }}>📊 Mi Álbum</div>
      {/* Same rounding as GlobalStatsBar: floor, derived from the displayed count */}
      <div style={{ fontSize: 14, fontWeight: 700, color: accent.blue }}>
        {Math.floor((Math.round(collected) / total) * 100)}%
      </div>
    </div>
    <div style={{ width: "100%", height: 4, background: app.bgQuaternary, borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: accent.blue, borderRadius: 2 }} />
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
      <div style={{ ...cell, flex: "1 1 45%" }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          <span style={{ color: accent.blue }}>{Math.round(collected)}</span>
          <span style={{ color: app.textMuted, fontWeight: 500 }}>/{total}</span>
        </div>
        <div style={label}>Coleccionadas</div>
      </div>
      <div style={{ ...cell, flex: "1 1 45%" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent.blue }}>{Math.round(missing)}</div>
        <div style={label}>Me faltan</div>
      </div>
      <div style={{ ...cell, flex: "1 1 100%" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: accent.orange }}>{Math.round(repeated)}</div>
        <div style={label}>Repetidas</div>
      </div>
    </div>
  </div>
);
