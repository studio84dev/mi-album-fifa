import { useVideoConfig } from "remotion";

/**
 * Every scene adapts its composition to the aspect ratio instead of being cropped:
 * - vertical (1080x1920): copy on top, device below, TikTok/Reels safe area respected
 * - landscape (1920x1080): copy on the left column, device(s) on the right
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const landscape = width > height;
  return { landscape, width, height };
};

export const pick = <T,>(landscape: boolean, vertical: T, horizontal: T): T =>
  landscape ? horizontal : vertical;
