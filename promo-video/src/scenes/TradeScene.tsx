import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone, phoneMetrics } from "../components/Phone";
import { ScreenImage, TapIndicator } from "../components/app/Chrome";
import {
  CONFIRM_BTN,
  ExchangeMatchScreen,
  I_GIVE,
  ScannerScreen,
  THEY_GIVE,
} from "../components/app/ExchangeScreens";
import { Headline } from "../components/Headline";
import { useLayout, pick } from "../layout";
import { CLAMP, EASE_CAMERA, EASE_IN_OUT, EASE_OUT } from "../theme";

// Timeline (frames)
const SCAN: [number, number] = [22, 50];
const MATCH_AT = 52;
const PUSH: [number, number] = [54, 86];
const TAP_THEY = 72;
const TAP_I = 98;
const TAP_CONFIRM = 134;

const SELECT_THEY = { x: 262, y: 125 };
const SELECT_I = { x: 262, y: 287 };

// Exported so the celebration scene starts exactly where this one ends
export const TRADE_HERO = {
  vertical: { x: 540, y: 1125, w: 540, rotateY: -6, rotateX: 4 },
  landscape: { x: 1400, y: 548, w: 410, rotateY: -8, rotateX: 4 },
};

export const TradeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();
  const hero = pick(landscape, TRADE_HERO.vertical, TRADE_HERO.landscape);

  const L = pick(
    landscape,
    { x: 300, y: 1200, w: 430, outX: 20, outY: 1290 },
    { x: 1130, y: 560, w: 350, outX: 1010, outY: 620 },
  );
  const R = pick(landscape, { x: 770, y: 1230, w: 480 }, { x: 1570, y: 560, w: 390 });

  const enterL = interpolate(frame, [0, 24], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const enterR = interpolate(frame, [4, 28], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const push = interpolate(frame, PUSH, [0, 1], { ...CLAMP, easing: EASE_CAMERA });

  const laser = interpolate(frame, SCAN, [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const lock = interpolate(frame, [SCAN[1] - 6, SCAN[1]], [0, 1], CLAMP);
  const flash = interpolate(frame, [MATCH_AT - 2, MATCH_AT, MATCH_AT + 10], [0, 0.9, 0], CLAMP);

  const theySel = THEY_GIVE.map((_, i) => interpolate(frame, [TAP_THEY + 2 + i * 3, TAP_THEY + 8 + i * 3], [0, 1], CLAMP));
  const iSel = I_GIVE.map((_, i) => interpolate(frame, [TAP_I + 2 + i * 3, TAP_I + 8 + i * 3], [0, 1], CLAMP));

  const tap = (at: number) => interpolate(frame, [at - 3, at, at + 5], [0, 1, 0], CLAMP);
  const fingerX = interpolate(frame, [TAP_THEY - 10, TAP_I - 8, TAP_CONFIRM - 12, TAP_CONFIRM - 3], [SELECT_THEY.x, SELECT_I.x, SELECT_I.x, CONFIRM_BTN.x], { ...CLAMP, easing: EASE_IN_OUT });
  const fingerY = interpolate(frame, [TAP_THEY - 10, TAP_I - 8, TAP_CONFIRM - 12, TAP_CONFIRM - 3], [SELECT_THEY.y, SELECT_I.y, SELECT_I.y, CONFIRM_BTN.y], { ...CLAMP, easing: EASE_IN_OUT });

  // QR "data beam" from the other phone into the scanner
  const lm = phoneMetrics(L.w);
  const rm = phoneMetrics(R.w);
  const ax = L.x + 20;
  const ay = L.y - 60 * lm.k;
  const bx = R.x - 10;
  const by = R.y - 130 * rm.k;
  const beamLen = Math.hypot(bx - ax, by - ay);
  const beamAngle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const beam = interpolate(frame, [SCAN[0], SCAN[0] + 10, SCAN[1] - 4, SCAN[1] + 2], [0, 1, 1, 0], CLAMP);

  return (
    <AbsoluteFill>
      <Headline from={4} lines={[[{ text: "Intercambia" }], [{ text: "con " }, { text: "QR.", tone: "blue" }]]} />

      {/* Other collector showing their QR (real screen) */}
      <Phone
        x={interpolate(enterL, [0, 1], [L.x - 700, L.x]) + push * (L.outX - L.x)}
        y={L.y + push * (L.outY - L.y)}
        width={L.w}
        rotateX={4}
        rotateY={interpolate(push, [0, 1], [24, 40])}
        rotateZ={-3}
        scale={interpolate(push, [0, 1], [1, 0.82])}
        opacity={interpolate(push, [0, 0.8], [1, 0], CLAMP)}
      >
        <ScreenImage src="screens/qr-modal.png" />
      </Phone>

      {/* Beam */}
      <div
        style={{
          position: "absolute",
          left: ax,
          top: ay,
          width: beamLen,
          height: 6,
          transformOrigin: "0% 50%",
          rotate: `${beamAngle}deg`,
          opacity: beam,
          borderRadius: 3,
          background: `linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(147,197,253,0.9) ${laser * 100}%, rgba(59,130,246,0) ${Math.min(100, laser * 100 + 30)}%)`,
          boxShadow: "0 0 30px 8px rgba(59,130,246,0.35)",
          filter: "blur(0.5px)",
        }}
      />

      {/* Me: scanning, then choosing what to trade */}
      <Phone
        x={interpolate(enterR, [0, 1], [R.x + 700, R.x]) + push * (hero.x - R.x)}
        y={R.y + push * (hero.y - R.y)}
        width={R.w}
        scale={interpolate(push, [0, 1], [1, hero.w / R.w])}
        rotateX={interpolate(push, [0, 1], [5, hero.rotateX])}
        rotateY={interpolate(push, [0, 1], [-22, hero.rotateY])}
        rotateZ={interpolate(push, [0, 1], [2, 0])}
      >
        {frame < MATCH_AT ? (
          <ScannerScreen laser={laser} lock={lock} />
        ) : (
          <ExchangeMatchScreen theySel={theySel} iSel={iSel} confirmPress={tap(TAP_CONFIRM)} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "#ffffff", opacity: flash, zIndex: 60 }} />
        <TapIndicator
          x={fingerX}
          y={fingerY}
          visible={interpolate(frame, [TAP_THEY - 14, TAP_THEY - 6, TAP_CONFIRM + 5, TAP_CONFIRM + 12], [0, 1, 1, 0], CLAMP)}
          press={Math.max(tap(TAP_THEY), tap(TAP_I), tap(TAP_CONFIRM))}
        />
      </Phone>
    </AbsoluteFill>
  );
};
