import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

type SoftZoomProps = Record<string, never>;

/**
 * Premium crossfade: outgoing scene pushes forward and defocuses, incoming scene settles in,
 * with a soft diagonal light sweep across the cut.
 */
const SoftZoom: React.FC<TransitionPresentationComponentProps<SoftZoomProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const entering = presentationDirection === "entering";
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={
          entering
            ? {
                opacity: interpolate(p, [0.35, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                scale: `${interpolate(p, [0, 1], [0.965, 1])}`,
                filter: `blur(${(1 - p) * 10}px)`,
              }
            : {
                opacity: interpolate(p, [0, 0.6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                scale: `${interpolate(p, [0, 1], [1, 1.05])}`,
                filter: `blur(${p * 12}px)`,
              }
        }
      >
        {children}
      </AbsoluteFill>
      {entering ? (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(105deg, rgba(147,197,253,0) 35%, rgba(147,197,253,0.16) 48%, rgba(255,255,255,0.22) 50%, rgba(253,186,116,0.12) 53%, rgba(147,197,253,0) 65%)",
            translate: `${interpolate(p, [0, 1], [-100, 100])}% 0%`,
            opacity: Math.sin(p * Math.PI),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const softZoom = (): TransitionPresentation<SoftZoomProps> => ({ component: SoftZoom, props: {} });
