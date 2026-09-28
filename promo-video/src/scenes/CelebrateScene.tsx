import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { SuccessScreen } from "../components/app/ExchangeScreens";
import { Confetti } from "../components/Confetti";
import { Headline } from "../components/Headline";
import { useLayout, pick } from "../layout";
import { CLAMP, EASE_BACK, EASE_OUT } from "../theme";
import { TRADE_HERO } from "./TradeScene";

const BURST = 8;

export const CelebrateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();
  const hero = pick(landscape, TRADE_HERO.vertical, TRADE_HERO.landscape);
  const burstY = hero.y - pick(landscape, 180, 90);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${hero.x}px ${burstY}px, rgba(250,204,21,0.22) 0%, rgba(232,116,42,0.12) 22%, rgba(232,116,42,0) 45%)`,
          opacity: interpolate(frame, [BURST - 2, BURST + 10], [0, 1], CLAMP),
        }}
      />
      <Confetti x={hero.x} y={burstY} from={BURST} layer="back" seed="trade" power={pick(landscape, 1.25, 1)} count={110} />
      <Phone
        x={hero.x}
        y={hero.y + interpolate(frame, [0, 85], [0, -14])}
        width={hero.w}
        rotateX={interpolate(frame, [0, 85], [hero.rotateX, 2])}
        rotateY={interpolate(frame, [0, 85], [hero.rotateY, 3])}
        scale={interpolate(frame, [0, 85], [1, 1.035])}
      >
        <SuccessScreen
          emoji={interpolate(frame, [2, 14], [0, 1], { ...CLAMP, easing: EASE_BACK })}
          title={interpolate(frame, [6, 18], [0, 1], { ...CLAMP, easing: EASE_OUT })}
          desc={interpolate(frame, [10, 22], [0, 1], { ...CLAMP, easing: EASE_OUT })}
          button={interpolate(frame, [14, 26], [0, 1], { ...CLAMP, easing: EASE_OUT })}
        />
      </Phone>
      <Confetti x={hero.x} y={burstY} from={BURST} layer="front" seed="trade" power={pick(landscape, 1.25, 1)} count={110} />
      <Headline from={2} lines={[[{ text: "Completa" }], [{ text: "tu álbum.", tone: "orange" }]]} />
    </AbsoluteFill>
  );
};
