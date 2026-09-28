import { EndCard } from "../components/EndCard";

type EndSceneProps = {
  playBadgeSrc?: string;
};

export const EndScene: React.FC<EndSceneProps> = ({ playBadgeSrc = "" }) => <EndCard playBadgeSrc={playBadgeSrc} />;
