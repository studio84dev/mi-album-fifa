import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";

// Marketing typography
export const { fontFamily: displayFont } = loadInter("normal", {
  weights: ["500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

// In-app UI (Android system font, matches the real app)
export const { fontFamily: uiFont } = loadRoboto("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
