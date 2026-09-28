import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Persistent brand backdrop shared by every scene (deep navy + blue/orange light blooms),
 * derived from the Play Store feature graphic. Lives below the TransitionSeries so scene
 * changes never flash the background.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const big = Math.max(width, height);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(130% 90% at 50% 0%, #15254a 0%, #0c1530 40%, #070b18 75%, #04060d 100%)",
        overflow: "hidden",
      }}
    >
      {/* Blue bloom */}
      <div
        style={{
          position: "absolute",
          width: big * 1.1,
          height: big * 1.1,
          left: width * 0.5 - big * 0.55 + Math.sin(t * 0.35) * width * 0.18 - width * 0.22,
          top: height * 0.18 - big * 0.55 + Math.cos(t * 0.28) * height * 0.06,
          background: "radial-gradient(circle, rgba(59,130,246,0.42) 0%, rgba(59,130,246,0.12) 38%, rgba(59,130,246,0) 65%)",
        }}
      />
      {/* Orange bloom */}
      <div
        style={{
          position: "absolute",
          width: big * 0.95,
          height: big * 0.95,
          left: width * 0.5 - big * 0.475 + Math.cos(t * 0.3) * width * 0.16 + width * 0.26,
          top: height * 0.82 - big * 0.475 + Math.sin(t * 0.33) * height * 0.05,
          background: "radial-gradient(circle, rgba(232,116,42,0.34) 0%, rgba(232,116,42,0.1) 40%, rgba(232,116,42,0) 66%)",
        }}
      />
      {/* Sticker-grid texture: a nod to the album grid */}
      <div
        style={{
          position: "absolute",
          inset: -80,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.07) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(148,163,184,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "96px 88px",
          backgroundPosition: `${(t * 6) % 96}px ${(t * 10) % 88}px`,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 0%, transparent 80%)",
        }}
      />
      {/* Vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
