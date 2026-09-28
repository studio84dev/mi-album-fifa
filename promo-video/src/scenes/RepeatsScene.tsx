import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { CountryScreen } from "../components/app/CountryScreen";
import { RepeatModal, MODAL_PLUS, MODAL_SAVE } from "../components/app/RepeatModal";
import { TapIndicator } from "../components/app/Chrome";
import { tileCenter, type TileVisual } from "../components/app/StickerTile";
import { Headline } from "../components/Headline";
import { displayFont } from "../fonts";
import { useLayout, pick } from "../layout";
import { accent, CLAMP, EASE_BACK, EASE_IN_OUT, EASE_OUT } from "../theme";

// South Korea page: 11/20 collected, long-press on #7 to register 3 repeats (as in the recording)
const KOR_COLLECTED = [1, 2, 4, 5, 7, 10, 12, 15, 18, 19, 20];
const KOR_REPEATED: Record<number, number> = { 12: 2, 18: 2 };
const TARGET = 7;

// Timeline (frames)
const HOLD_START = 12;
const HOLD_END = 30;
const PLUS_TAPS = [46, 58];
const SAVE_TAP = 72;
const CLOSE = 78;
const POP = 86;
const BADGE_MAX = 6.2;

export const RepeatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();

  const count = 1 + PLUS_TAPS.filter((t) => frame >= t + 2).length;
  const saved = frame >= CLOSE;
  const tap = (at: number) => interpolate(frame, [at - 3, at, at + 5], [0, 1, 0], CLAMP);

  const tiles: TileVisual[] = Array.from({ length: 20 }).map((_, i) => {
    const num = i + 1;
    const collected = KOR_COLLECTED.includes(num) ? 1 : 0;
    if (num !== TARGET) return { collected, repeated: KOR_REPEATED[num] ?? 0 };
    return {
      collected,
      repeated: saved ? 3 : 0,
      press: interpolate(frame, [HOLD_START, HOLD_START + 4, HOLD_END, HOLD_END + 4], [0, 1, 1, 0], CLAMP),
      pop: interpolate(frame, [CLOSE, CLOSE + 5, CLOSE + 14], [0, 0.16, 0], CLAMP),
      badgeScale: interpolate(frame, [CLOSE, CLOSE + 8], [0, 1], { ...CLAMP, easing: EASE_BACK }),
    };
  });

  const modal = interpolate(frame, [HOLD_END, HOLD_END + 9, CLOSE - 2, CLOSE + 4], [0, 1, 1, 0], { ...CLAMP, easing: EASE_OUT });
  const t7 = tileCenter(TARGET);

  // Finger path: tile #7 -> "+" -> "Guardar"
  const fingerX = interpolate(frame, [HOLD_END + 4, PLUS_TAPS[0] - 4, SAVE_TAP - 8, SAVE_TAP - 2], [t7.x, MODAL_PLUS.x, MODAL_PLUS.x, MODAL_SAVE.x], { ...CLAMP, easing: EASE_IN_OUT });
  const fingerY = interpolate(frame, [HOLD_END + 4, PLUS_TAPS[0] - 4, SAVE_TAP - 8, SAVE_TAP - 2], [t7.y, MODAL_PLUS.y, MODAL_PLUS.y, MODAL_SAVE.y], { ...CLAMP, easing: EASE_IN_OUT });
  const fingerVisible = interpolate(frame, [HOLD_START - 6, HOLD_START, SAVE_TAP + 4, SAVE_TAP + 10], [0, 1, 1, 0], CLAMP);
  const press = Math.max(
    interpolate(frame, [HOLD_START - 2, HOLD_START + 2, HOLD_END, HOLD_END + 3], [0, 1, 1, 0], CLAMP),
    tap(PLUS_TAPS[0]),
    tap(PLUS_TAPS[1]),
    tap(SAVE_TAP),
  );

  // Floating "+3" badge that breaks out of the screen
  const pop = interpolate(frame, [POP, POP + 22], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const popIn = interpolate(frame, [POP, POP + 6], [0, 1], CLAMP);

  const P = pick(
    landscape,
    { x: 540, y: 1235, w: 580 },
    { x: 1390, y: 548, w: 410 },
  );

  return (
    <AbsoluteFill>
      <Headline
        from={4}
        stagger={7}
        lines={[
          [{ text: "Marca. " }, { text: "Repite.", tone: "orange" }],
          [{ text: "Controla." }],
        ]}
      />
      <Phone
        x={P.x}
        y={interpolate(frame, [0, 20], [P.y + 60, P.y], { ...CLAMP, easing: EASE_OUT })}
        width={P.w}
        rotateX={5}
        rotateY={interpolate(frame, [0, 120], [14, 4])}
        rotateZ={interpolate(frame, [0, 120], [1.5, 0])}
        overlay={
          // Authored at its final (large) size and scaled *down* at the start, so it stays crisp
          <div
            style={{
              position: "absolute",
              left: t7.x + 18,
              top: t7.y - 22 - 12 * (BADGE_MAX - 1),
              opacity: popIn,
              transform: `translate3d(${pop * 96}px, ${pop * -92}px, ${pop * 180}px) rotate(${pop * -8}deg) scale(${(1 + pop * (BADGE_MAX - 1)) / BADGE_MAX})`,
              transformOrigin: "0% 100%",
              background: `linear-gradient(160deg, #f59e0b 0%, ${accent.orange} 70%)`,
              borderRadius: 3 * BADGE_MAX,
              padding: `0 ${2.5 * BADGE_MAX}px`,
              color: "#fff",
              fontFamily: displayFont,
              fontWeight: 800,
              fontSize: 8.5 * BADGE_MAX,
              lineHeight: `${12 * BADGE_MAX}px`,
              boxShadow: `0 ${pop * 30}px ${pop * 50}px rgba(0,0,0,0.35), 0 0 ${pop * 60}px rgba(232,116,42,0.6)`,
            }}
          >
            +3
          </div>
        }
      >
        <CountryScreen
          code="KOR"
          name="South Korea"
          iso="kr"
          page={12}
          collectedCount={KOR_COLLECTED.length}
          repeatedCount={4 + (saved ? 3 : 0)}
          tiles={tiles}
          curiosity={{
            index: 1,
            total: 10,
            text: "A la selección de Corea del Sur le dicen 'Los Guerreros Taeguk' o también 'Los Tigres de Asia' debido a la fuerza con la que juegan.",
          }}
        >
          <RepeatModal
            code="KOR"
            num={TARGET}
            count={count}
            progress={modal}
            plusPress={Math.max(tap(PLUS_TAPS[0]), tap(PLUS_TAPS[1]))}
            savePress={tap(SAVE_TAP)}
            countPop={Math.max(
              interpolate(frame, [PLUS_TAPS[0] + 2, PLUS_TAPS[0] + 5, PLUS_TAPS[0] + 10], [0, 1, 0], CLAMP),
              interpolate(frame, [PLUS_TAPS[1] + 2, PLUS_TAPS[1] + 5, PLUS_TAPS[1] + 10], [0, 1, 0], CLAMP),
            )}
          />
          <TapIndicator
            x={fingerX}
            y={fingerY}
            visible={fingerVisible}
            press={press}
            hold={interpolate(frame, [HOLD_START + 2, HOLD_END], [0, 1], CLAMP) * (frame < HOLD_END + 3 ? 1 : 0)}
          />
        </CountryScreen>
      </Phone>
    </AbsoluteFill>
  );
};
