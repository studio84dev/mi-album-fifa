import type { ReactNode } from "react";

// App screens are authored in Android dp (1080x2400 device @3x => 360x800 dp)
export const SCREEN_W = 360;
export const SCREEN_H = 800;

export interface PhoneProps {
  /** Center of the device in composition pixels */
  x: number;
  y: number;
  /** Outer device width in composition pixels */
  width: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  opacity?: number;
  perspective?: number;
  /** Screen content, laid out in dp (360x800) */
  children: ReactNode;
  /** Layer sharing the device's 3D space (dp coordinates) that can pop out with translateZ */
  overlay?: ReactNode;
}

export const phoneMetrics = (width: number) => {
  const bezel = width * 0.03;
  const screenW = width - bezel * 2;
  const k = screenW / SCREEN_W;
  const screenH = SCREEN_H * k;
  return { bezel, screenW, screenH, k, height: screenH + bezel * 2, radius: width * 0.125 };
};

export const Phone: React.FC<PhoneProps> = ({
  x,
  y,
  width,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  scale = 1,
  opacity = 1,
  perspective = 2600,
  children,
  overlay,
}) => {
  const { bezel, screenW, screenH, k, height, radius } = phoneMetrics(width);
  const glare = 48 + rotateY * 2.4 - rotateX * 0.8;

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        opacity,
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Contact shadow */}
      <div
        style={{
          position: "absolute",
          left: width * 0.06,
          right: width * 0.06,
          top: height * 0.06,
          bottom: -height * 0.02,
          borderRadius: radius,
          background: "rgba(0,0,0,0.55)",
          filter: `blur(${width * 0.07}px)`,
          transform: `translateZ(-60px) translate(${-rotateY * 1.4}px, ${width * 0.07}px)`,
        }}
      />
      {/* Side buttons */}
      <div
        style={{
          position: "absolute",
          right: -width * 0.008,
          top: height * 0.2,
          width: width * 0.012,
          height: height * 0.07,
          borderRadius: 4,
          background: "linear-gradient(90deg,#2b2f38,#4b5160)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -width * 0.008,
          top: height * 0.3,
          width: width * 0.012,
          height: height * 0.12,
          borderRadius: 4,
          background: "linear-gradient(90deg,#2b2f38,#4b5160)",
        }}
      />
      {/* Frame */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "linear-gradient(150deg,#4a505c 0%,#1a1d24 22%,#0b0d11 55%,#1c2029 80%,#3d434f 100%)",
          boxShadow:
            "inset 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 5px rgba(0,0,0,0.55), 0 40px 90px rgba(0,0,0,0.45)",
        }}
      />
      {/* Screen */}
      <div
        style={{
          position: "absolute",
          left: bezel,
          top: bezel,
          width: screenW,
          height: screenH,
          borderRadius: radius - bezel,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <div
          style={{
            position: "relative",
            width: SCREEN_W,
            height: SCREEN_H,
            transform: `scale(${k})`,
            transformOrigin: "0 0",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
        {/* Punch-hole camera */}
        <div
          style={{
            position: "absolute",
            top: 9 * k,
            left: screenW / 2 - 5.5 * k,
            width: 11 * k,
            height: 11 * k,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%,#1f2937 0%,#05070a 60%)",
            boxShadow: "0 0 0 1.5px rgba(30,37,48,0.9)",
          }}
        />
        {/* Glass reflection */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(115deg, rgba(255,255,255,0) ${glare - 26}%, rgba(255,255,255,0.13) ${glare}%, rgba(255,255,255,0) ${glare + 16}%)`,
          }}
        />
      </div>
      {overlay ? (
        <div
          style={{
            position: "absolute",
            left: bezel,
            top: bezel,
            width: SCREEN_W,
            height: SCREEN_H,
            transform: `scale(${k})`,
            transformOrigin: "0 0",
            transformStyle: "preserve-3d",
          }}
        >
          {overlay}
        </div>
      ) : null}
    </div>
  );
};
