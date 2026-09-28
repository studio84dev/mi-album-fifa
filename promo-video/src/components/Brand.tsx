import { Img, staticFile } from "remotion";
import { displayFont } from "../fonts";
import { promo } from "../theme";

interface AppIconProps {
  size: number;
}

/** The real launcher icon (apps/mobile/assets/images/icon.png) in a store-style rounded tile */
export const AppIcon: React.FC<AppIconProps> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.23,
      overflow: "hidden",
      background: "#ffffff",
      boxShadow: `0 ${size * 0.12}px ${size * 0.3}px rgba(0,0,0,0.45), 0 0 0 ${Math.max(1, size * 0.01)}px rgba(255,255,255,0.18)`,
      position: "relative",
    }}
  >
    <Img
      src={staticFile("brand/icon.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%", scale: "1.26" }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: size * 0.23,
        background: "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 40%)",
      }}
    />
  </div>
);

interface BrandLockupProps {
  iconSize: number;
  fontSize: number;
}

export const BrandLockup: React.FC<BrandLockupProps> = ({ iconSize, fontSize }) => (
  <div style={{ display: "flex", alignItems: "center", gap: iconSize * 0.28 }}>
    <AppIcon size={iconSize} />
    <div
      style={{
        fontFamily: displayFont,
        fontWeight: 700,
        fontSize,
        color: promo.ink,
        letterSpacing: -fontSize * 0.02,
      }}
    >
      Album Fan
    </div>
  </div>
);
