import { interpolate, useCurrentFrame } from "remotion";
import { displayFont } from "../fonts";
import { useLayout } from "../layout";
import { CLAMP, EASE_OUT, promo } from "../theme";

export type Tone = "white" | "blue" | "orange" | "muted";

export interface HeadlinePart {
  text: string;
  tone?: Tone;
}

export type HeadlineLine = HeadlinePart[];

const toneStyle = (tone: Tone): React.CSSProperties => {
  if (tone === "blue") {
    return {
      backgroundImage: "linear-gradient(95deg,#93c5fd 0%,#3b82f6 60%,#2563eb 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  if (tone === "orange") {
    return {
      backgroundImage: "linear-gradient(95deg,#fdba74 0%,#f59e0b 35%,#e8742a 100%)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }
  return { color: tone === "muted" ? promo.inkMuted : promo.ink };
};

interface HeadlineProps {
  lines: HeadlineLine[];
  /** Frame the first line starts revealing */
  from?: number;
  stagger?: number;
  /** Vertical layout top offset (px) */
  top?: number;
  size?: number;
  /** Optional frame at which the block starts leaving */
  exitAt?: number;
}

/**
 * Masked line-by-line reveal. Positions itself according to the aspect ratio:
 * centered above the device on vertical, left column on landscape.
 */
export const Headline: React.FC<HeadlineProps> = ({ lines, from = 0, stagger = 6, top = 250, size, exitAt }) => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();
  const fontSize = size ?? (landscape ? 116 : 94);
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 12], [0, 1], { ...CLAMP, easing: EASE_OUT });

  return (
    <div
      style={{
        position: "absolute",
        ...(landscape
          ? { left: 150, width: 880, top: 0, bottom: 0, justifyContent: "center", alignItems: "flex-start", textAlign: "left" }
          : { left: 80, right: 80, top, alignItems: "center", textAlign: "center" }),
        display: "flex",
        flexDirection: "column",
        fontFamily: displayFont,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.04,
        letterSpacing: -fontSize * 0.035,
        opacity: 1 - exit,
        translate: `0px ${-exit * 40}px`,
      }}
    >
      {lines.map((parts, i) => {
        const start = from + i * stagger;
        const p = interpolate(frame, [start, start + 18], [0, 1], { ...CLAMP, easing: EASE_OUT });
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: fontSize * 0.1, marginBottom: -fontSize * 0.06 }}>
            <div
              style={{
                translate: `0px ${(1 - p) * 110}%`,
                opacity: interpolate(p, [0, 0.4, 1], [0, 1, 1]),
                filter: `blur(${(1 - p) * 8}px)`,
                whiteSpace: "nowrap",
              }}
            >
              {parts.map((part, j) => (
                <span key={j} style={toneStyle(part.tone ?? "white")}>
                  {part.text}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
