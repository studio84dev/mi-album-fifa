import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { CountryScreen } from "../components/app/CountryScreen";
import type { TileVisual } from "../components/app/StickerTile";
import { Headline } from "../components/Headline";
import { BrandLockup } from "../components/Brand";
import { useLayout, pick } from "../layout";
import { CLAMP, EASE_CAMERA, EASE_OUT } from "../theme";

// Real Brazil page from the screen recording (14/20)
const BRA_COLLECTED = [1, 2, 5, 6, 7, 9, 10, 11, 12, 16, 17, 18, 19, 20];
const IGNITE_ORDER = [...BRA_COLLECTED].sort((a, b) => random(`bra-${a}`) - random(`bra-${b}`));
const igniteAt = (num: number) => 10 + IGNITE_ORDER.indexOf(num) * 3.6;

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { landscape } = useLayout();

  const tiles: TileVisual[] = Array.from({ length: 20 }).map((_, i) => {
    const num = i + 1;
    if (!BRA_COLLECTED.includes(num)) return { collected: 0, repeated: 0 };
    const at = igniteAt(num);
    return {
      collected: interpolate(frame, [at, at + 6], [0, 1], CLAMP),
      repeated: 0,
      pop: interpolate(frame, [at, at + 4, at + 12], [0, 0.14, 0], CLAMP),
      glow: interpolate(frame, [at, at + 5, 96, 116], [0, 1, 0.7, 0], CLAMP),
    };
  });
  const lit = BRA_COLLECTED.filter((n) => frame >= igniteAt(n) + 3).length;

  // Camera: macro on the grid -> pull back to hero device
  const macro = pick(landscape, { x: 760, y: 1560, scale: 2.8 }, { x: 1100, y: 860, scale: 3.2 });
  const hero = pick(landscape, { x: 540, y: 1280, w: 560 }, { x: 1390, y: 548, w: 410 });
  const pull = [62, 120] as const;

  return (
    <AbsoluteFill>
      {/* Spotlight behind the device */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${pick(landscape, "50% 62%", "72% 50%")}, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 45%)`,
          opacity: interpolate(frame, [20, 70], [0, 1], CLAMP),
        }}
      />
      <Phone
        x={interpolate(frame, [0, pull[0], pull[1]], [macro.x, macro.x, hero.x], { ...CLAMP, easing: EASE_CAMERA })}
        y={interpolate(frame, [0, pull[0], pull[1]], [macro.y + 40, macro.y, hero.y], { ...CLAMP, easing: EASE_CAMERA })}
        width={hero.w}
        scale={interpolate(frame, [0, pull[0], pull[1]], [macro.scale * 1.06, macro.scale, 1], { ...CLAMP, easing: EASE_CAMERA })}
        rotateX={interpolate(frame, [0, pull[0], pull[1], 150], [34, 30, 7, 5], { ...CLAMP, easing: EASE_CAMERA })}
        rotateY={interpolate(frame, [0, pull[0], pull[1], 150], [4, 0, -16, -12], { ...CLAMP, easing: EASE_CAMERA })}
        rotateZ={interpolate(frame, [0, pull[0], pull[1]], [-12, -9, 0], { ...CLAMP, easing: EASE_CAMERA })}
      >
        <CountryScreen
          code="BRA"
          name="Brazil"
          iso="br"
          page={24}
          collectedCount={lit}
          repeatedCount={0}
          tiles={tiles}
          curiosity={{
            index: 2,
            total: 10,
            text: "A la selección brasileña le dicen 'La Canarinha' (El Canario) porque su camiseta es de un color amarillo brillante idéntico al de esa pequeña ave.",
          }}
        >
          {/* Lights-on: the screen starts dark and brightens as the stickers ignite */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#020617",
              opacity: interpolate(frame, [0, 60], [0.72, 0], { ...CLAMP, easing: EASE_OUT }),
              zIndex: 40,
            }}
          />
        </CountryScreen>
      </Phone>

      {/* Brand + headline */}
      <div
        style={{
          position: "absolute",
          ...(landscape ? { left: 150, top: 300 } : { left: 0, right: 0, top: 240, display: "flex", justifyContent: "center" }),
          opacity: interpolate(frame, [88, 104], [0, 1], CLAMP),
          translate: `0px ${interpolate(frame, [88, 108], [24, 0], { ...CLAMP, easing: EASE_OUT })}px`,
        }}
      >
        <BrandLockup iconSize={pick(landscape, 76, 84)} fontSize={pick(landscape, 46, 50)} />
      </div>
      <Headline
        from={96}
        top={346}
        size={pick(landscape, 104, 88)}
        stagger={5}
        lines={[[{ text: "Tu álbum" }], [{ text: "del Mundial." }], [{ text: "En tu bolsillo.", tone: "blue" }]]}
      />
    </AbsoluteFill>
  );
};
