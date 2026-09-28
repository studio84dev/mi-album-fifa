import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { SFX_CUES } from "../timeline";

interface SoundtrackProps {
  /** Royalty-free track placed in public/, e.g. "audio/music.mp3". Empty = silent */
  musicSrc: string;
  /** Subtle UI sounds (taps, whooshes, success) */
  sfx: boolean;
}

const SFX_URL = {
  whoosh: "https://remotion.media/whoosh.wav",
  tap: "https://remotion.media/mouse-click.wav",
  scan: "https://remotion.media/shutter-modern.wav",
  success: "https://remotion.media/ding.wav",
} as const;

/** Visual storytelling comes first: the video is fully readable muted, audio is opt-in */
export const Soundtrack: React.FC<SoundtrackProps> = ({ musicSrc, sfx }) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      {musicSrc ? (
        <Audio
          src={staticFile(musicSrc)}
          volume={(f) =>
            interpolate(f, [0, 15, durationInFrames - 30, durationInFrames], [0, 0.6, 0.6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      {sfx
        ? SFX_CUES.map((cue) => (
            <Sequence key={`${cue.kind}-${cue.at}`} from={cue.at} durationInFrames={45} layout="none">
              <Audio src={SFX_URL[cue.kind]} volume={() => (cue.kind === "tap" ? 0.35 : 0.25)} />
            </Sequence>
          ))
        : null}
    </>
  );
};
