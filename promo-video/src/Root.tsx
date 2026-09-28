import { Composition, Folder } from "remotion";
import { AlbumFanPromo } from "./AlbumFanPromo";
import { HookScene } from "./scenes/HookScene";
import { RepeatsScene } from "./scenes/RepeatsScene";
import { ProgressScene } from "./scenes/ProgressScene";
import { TradeScene } from "./scenes/TradeScene";
import { CelebrateScene } from "./scenes/CelebrateScene";
import { EndScene } from "./scenes/EndScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Instagram Reels / TikTok: promo-social-vertical.mp4 */}
      <Composition
        id="AlbumFanVertical"
        component={AlbumFanPromo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={720}
        defaultProps={{ musicSrc: "", sfx: false, playBadgeSrc: "" }}
      />
      {/* Google Play promo video (YouTube, 16:9): promo-google-play.mp4 */}
      <Composition
        id="AlbumFanPlay"
        component={AlbumFanPromo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={720}
        defaultProps={{ musicSrc: "", sfx: false, playBadgeSrc: "" }}
      />
      <Folder name="Scenes">
        <Composition id="Hook" component={HookScene} width={1080} height={1920} fps={30} durationInFrames={150} />
        <Composition id="Repeats" component={RepeatsScene} width={1080} height={1920} fps={30} durationInFrames={120} />
        <Composition id="Progress" component={ProgressScene} width={1080} height={1920} fps={30} durationInFrames={135} />
        <Composition id="Trade" component={TradeScene} width={1080} height={1920} fps={30} durationInFrames={165} />
        <Composition id="Celebrate" component={CelebrateScene} width={1080} height={1920} fps={30} durationInFrames={85} />
        <Composition
          id="End"
          component={EndScene}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={123}
          defaultProps={{ playBadgeSrc: "" }}
        />
      </Folder>
    </>
  );
};
