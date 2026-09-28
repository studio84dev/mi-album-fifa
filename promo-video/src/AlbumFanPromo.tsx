import { AbsoluteFill } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { Background } from "./components/Background";
import { Soundtrack } from "./components/Soundtrack";
import { softZoom } from "./components/transitions";
import { HookScene } from "./scenes/HookScene";
import { RepeatsScene } from "./scenes/RepeatsScene";
import { ProgressScene } from "./scenes/ProgressScene";
import { TradeScene } from "./scenes/TradeScene";
import { CelebrateScene } from "./scenes/CelebrateScene";
import { EndScene } from "./scenes/EndScene";
import { EASE_IN_OUT } from "./theme";

export type PromoProps = {
  musicSrc: string;
  sfx: boolean;
  playBadgeSrc: string;
};

/**
 * Concept A — "Tu álbum, completo". Same scenes for every aspect ratio; each scene
 * re-composes itself via useLayout() (no cropping or stretching).
 */
export const AlbumFanPromo: React.FC<PromoProps> = ({ musicSrc, sfx, playBadgeSrc }) => (
  <AbsoluteFill style={{ backgroundColor: "#060a14" }}>
    <Background />
    <TransitionSeries>
      <TransitionSeries.Sequence name="Hook" durationInFrames={150}>
        <HookScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={softZoom()} timing={linearTiming({ durationInFrames: 12, easing: EASE_IN_OUT })} />
      <TransitionSeries.Sequence name="Repeats" durationInFrames={120}>
        <RepeatsScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={softZoom()} timing={linearTiming({ durationInFrames: 12, easing: EASE_IN_OUT })} />
      <TransitionSeries.Sequence name="Progress" durationInFrames={135}>
        <ProgressScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={softZoom()} timing={linearTiming({ durationInFrames: 12, easing: EASE_IN_OUT })} />
      <TransitionSeries.Sequence name="Trade" durationInFrames={165}>
        <TradeScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={softZoom()} timing={linearTiming({ durationInFrames: 10, easing: EASE_IN_OUT })} />
      <TransitionSeries.Sequence name="Celebrate" durationInFrames={85}>
        <CelebrateScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={softZoom()} timing={linearTiming({ durationInFrames: 12, easing: EASE_IN_OUT })} />
      <TransitionSeries.Sequence name="End" durationInFrames={123}>
        <EndScene playBadgeSrc={playBadgeSrc} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Soundtrack musicSrc={musicSrc} sfx={sfx} />
  </AbsoluteFill>
);
