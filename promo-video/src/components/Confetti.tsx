import { random, useCurrentFrame } from "remotion";
import { accent } from "../theme";

interface ConfettiProps {
  x: number;
  y: number;
  from: number;
  count?: number;
  power?: number;
  seed?: string;
  /** Only render particles for one depth layer (so some fly in front of the device) */
  layer?: "back" | "front";
}

const COLORS = [accent.blue, accent.orange, accent.yellow, "#ffffff", "#60a5fa", accent.green];

/** Deterministic confetti burst driven by the frame number (seeded randomness only) */
export const Confetti: React.FC<ConfettiProps> = ({ x, y, from, count = 90, power = 1, seed = "confetti", layer = "back" }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const front = random(`${seed}-layer-${i}`) > 0.62;
        if ((layer === "front") !== front) return null;
        const angle = -Math.PI / 2 + (random(`${seed}-a-${i}`) - 0.5) * Math.PI * 1.5;
        const speed = (22 + random(`${seed}-s-${i}`) * 34) * power;
        const drag = Math.pow(0.93, t);
        const dist = (speed * (1 - drag)) / (1 - 0.93);
        const gravity = 0.55 * t * t * 0.5;
        const px = x + Math.cos(angle) * dist + Math.sin(t * 0.15 + i) * 12;
        const py = y + Math.sin(angle) * dist + gravity;
        const size = (front ? 18 : 12) + random(`${seed}-z-${i}`) * 12;
        const rot = random(`${seed}-r-${i}`) * 360 + t * (8 + random(`${seed}-rs-${i}`) * 14);
        const life = 1 - Math.max(0, (t - 40) / 30);
        const isCircle = random(`${seed}-c-${i}`) > 0.7;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: size,
              height: isCircle ? size : size * 0.45,
              borderRadius: isCircle ? "50%" : 2,
              background: COLORS[i % COLORS.length],
              opacity: Math.max(0, life),
              transform: `rotate(${rot}deg) rotateX(${t * 11 + i * 30}deg)`,
              filter: front ? "blur(1px)" : "none",
            }}
          />
        );
      })}
    </>
  );
};
