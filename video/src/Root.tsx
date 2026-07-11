import { Composition } from "remotion";
import { EveranimaDemo } from "./EveranimaDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="EveranimaDemo"
      component={EveranimaDemo}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
