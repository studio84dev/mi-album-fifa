import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { AppIcon } from "./Brand";
import { displayFont } from "../fonts";
import { useLayout, pick } from "../layout";
import { accent, CLAMP, EASE_BACK, EASE_OUT, promo } from "../theme";

/** Drifting sticker tiles: echoes the album grid from the opening shot */
export const TileMosaic: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useLayout();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        maskImage: "radial-gradient(ellipse 42% 30% at 50% 48%, transparent 30%, black 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 42% 30% at 50% 48%, transparent 30%, black 100%)",
      }}
    >
      {Array.from({ length: 26 }).map((_, i) => {
        const depth = 0.45 + random(`mosaic-d-${i}`) * 0.9;
        const size = 70 * depth + 30;
        const x = random(`mosaic-x-${i}`) * width;
        const y0 = random(`mosaic-y-${i}`) * (height + 300);
        const y = ((y0 - frame * 2.2 * depth) % (height + 300) + height + 300) % (height + 300) - 150;
        const on = random(`mosaic-on-${i}`) > 0.45;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y,
              width: size,
              height: size / 1.1,
              borderRadius: size * 0.1,
              background: on ? "rgba(59,130,246,0.55)" : "rgba(148,163,184,0.08)",
              border: on ? "1px solid rgba(147,197,253,0.6)" : "1px solid rgba(148,163,184,0.18)",
              opacity: 0.16 + depth * 0.22,
              filter: `blur(${(1.4 - depth) * 5}px)`,
              rotate: `${(random(`mosaic-r-${i}`) - 0.5) * 30 + frame * 0.1 * (depth - 0.9)}deg`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: on ? "#fff" : "rgba(203,213,225,0.5)",
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: size * 0.32,
            }}
          >
            {1 + Math.floor(random(`mosaic-n-${i}`) * 20)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={12} fill={accent.blue} />
    <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface EndCardProps {
  /** Optional official "Disponible en Google Play" badge placed in public/ */
  playBadgeSrc?: string;
}

export const EndCard: React.FC<EndCardProps> = ({ playBadgeSrc }) => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();
  const s = pick(landscape, 1, 0.82);
  const pills = ["Gratis", "Sin anuncios", "En la nube"];

  const iconIn = interpolate(frame, [0, 20], [0, 1], { ...CLAMP, easing: EASE_BACK });
  const nameIn = interpolate(frame, [8, 26], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const subIn = interpolate(frame, [14, 30], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const ctaIn = interpolate(frame, [40, 56], [0, 1], { ...CLAMP, easing: EASE_BACK });
  const shine = interpolate(frame, [62, 86], [-60, 160], CLAMP);
  const pulse = interpolate(frame, [92, 100, 110], [0, 1, 0], CLAMP);

  return (
    <AbsoluteFill>
      <TileMosaic />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          ...(landscape ? { top: 0, bottom: 0 } : { top: 280, bottom: 420 }),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: displayFont,
          color: promo.ink,
        }}
      >
        {/* Icon with halo */}
        <div style={{ position: "relative", marginBottom: 44 * s }}>
          <div
            style={{
              position: "absolute",
              inset: -120 * s,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0) 65%)",
              opacity: iconIn,
              scale: `${0.8 + iconIn * 0.2 + pulse * 0.08}`,
            }}
          />
          <div
            style={{
              scale: `${0.4 + iconIn * 0.6}`,
              rotate: `${(1 - iconIn) * -14}deg`,
              opacity: interpolate(frame, [0, 6], [0, 1], CLAMP),
            }}
          >
            <AppIcon size={250 * s} />
          </div>
        </div>

        <div style={{ overflow: "hidden", paddingBottom: 12 }}>
          <div
            style={{
              fontSize: 136 * s,
              fontWeight: 800,
              letterSpacing: -136 * s * 0.035,
              lineHeight: 1,
              translate: `0px ${(1 - nameIn) * 110}%`,
            }}
          >
            Album Fan
          </div>
        </div>
        <div
          style={{
            marginTop: 14 * s,
            fontSize: 44 * s,
            fontWeight: 500,
            color: promo.inkMuted,
            opacity: subIn,
            translate: `0px ${(1 - subIn) * 20}px`,
          }}
        >
          Tu álbum digital del Mundial 2026
        </div>

        <div style={{ display: "flex", gap: 20 * s, marginTop: 52 * s }}>
          {pills.map((p, i) => {
            const pin = interpolate(frame, [24 + i * 5, 36 + i * 5], [0, 1], { ...CLAMP, easing: EASE_BACK });
            return (
              <div
                key={p}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12 * s,
                  padding: `${16 * s}px ${26 * s}px`,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.16)",
                  fontSize: 36 * s,
                  fontWeight: 600,
                  opacity: pin,
                  scale: `${0.7 + pin * 0.3}`,
                }}
              >
                <Check size={32 * s} />
                {p}
              </div>
            );
          })}
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 64 * s,
            height: 128 * s,
            padding: `0 ${76 * s}px`,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#60a5fa 0%,#3b82f6 45%,#2563eb 100%)",
            boxShadow: `0 ${24 * s}px ${60 * s}px rgba(37,99,235,${0.45 + pulse * 0.2}), inset 0 2px 0 rgba(255,255,255,0.35)`,
            fontSize: 52 * s,
            fontWeight: 800,
            letterSpacing: -1,
            opacity: ctaIn,
            scale: `${0.8 + ctaIn * 0.2 + pulse * 0.04}`,
            overflow: "hidden",
          }}
        >
          Descárgala gratis
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${shine}%`,
              width: "30%",
              background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
              rotate: "12deg",
              scale: "1 1.6",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 30 * s,
            opacity: interpolate(frame, [50, 64], [0, 1], CLAMP),
          }}
        >
          {playBadgeSrc ? (
            <Img src={staticFile(playBadgeSrc)} style={{ height: 110 * s }} />
          ) : (
            <div style={{ fontSize: 36 * s, fontWeight: 500, color: promo.inkMuted }}>Disponible en Google Play</div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
