import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { ScreenImage } from "../components/app/Chrome";
import { StatsCard } from "../components/app/StatsCard";
import { Headline } from "../components/Headline";
import { useLayout, pick } from "../layout";
import { app, CLAMP, EASE_CAMERA, EASE_OUT } from "../theme";

// Real totals from the screen recording: 889/994 collected, 105 missing, 20 repeated
const TOTAL = 994;
const COLLECTED = 889;
const REPEATED = 20;
const PCT = Math.floor((COLLECTED / TOTAL) * 100);

const LIFT: [number, number] = [26, 62];
const COUNT: [number, number] = [40, 100];

export const ProgressScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();

  const lift = interpolate(frame, LIFT, [0, 1], { ...CLAMP, easing: EASE_CAMERA });
  const c = interpolate(frame, COUNT, [0, 1], { ...CLAMP, easing: EASE_OUT });
  const rotY = interpolate(frame, [0, LIFT[0], LIFT[1], 135], [-6, -8, -22, -26], { ...CLAMP, easing: EASE_CAMERA });

  const P = pick(
    landscape,
    { x: 540, y: 1240, w: 580, dx: 40, dy: 90, cardX: -18, cardY: -120, cardScale: 1.05 },
    { x: 1420, y: 548, w: 410, dx: 90, dy: 30, cardX: -150, cardY: -30, cardScale: 1.3 },
  );

  return (
    <AbsoluteFill>
      <Headline from={4} lines={[[{ text: "Sabes cuánto" }], [{ text: "te falta.", tone: "blue" }]]} />
      {/* Soft glow that follows the lifted card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${pick(landscape, "50% 50%", "62% 48%")}, rgba(59,130,246,0.28) 0%, rgba(59,130,246,0) 40%)`,
          opacity: lift,
        }}
      />
      <Phone
        x={interpolate(lift, [0, 1], [P.x, P.x + P.dx])}
        y={interpolate(frame, [0, 18], [P.y + 50, P.y], { ...CLAMP, easing: EASE_OUT }) + lift * P.dy}
        width={P.w}
        scale={interpolate(lift, [0, 1], [1, 0.9])}
        rotateX={interpolate(lift, [0, 1], [5, 10])}
        rotateY={rotY}
        overlay={
          <div
            style={{
              position: "absolute",
              left: 32,
              top: 262,
              opacity: interpolate(frame, [10, 20], [0, 1], CLAMP),
              transform: `translate3d(${lift * P.cardX}px, ${lift * P.cardY}px, ${lift * 170}px) rotateY(${-rotY * lift}deg) rotateX(${-10 * lift}deg) scale(${interpolate(frame, [10, 22], [0.94, 1], { ...CLAMP, easing: EASE_OUT }) + lift * P.cardScale})`,
              transformOrigin: "50% 50%",
              borderRadius: 16,
              boxShadow: `0 ${lift * 18}px ${lift * 40}px rgba(2,6,23,${0.5 * lift})`,
            }}
          >
            <StatsCard
              pct={c * PCT}
              collected={c * COLLECTED}
              total={TOTAL}
              missing={TOTAL - c * COLLECTED}
              repeated={c * REPEATED}
            />
          </div>
        }
      >
        <ScreenImage src="screens/home-list.png" coverStatusBar={app.bgPrimary} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            opacity: interpolate(frame, [8, 20], [0, 1], CLAMP),
          }}
        />
      </Phone>
    </AbsoluteFill>
  );
};
