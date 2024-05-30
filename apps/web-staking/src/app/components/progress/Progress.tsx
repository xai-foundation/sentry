import { Progress } from "@nextui-org/progress";

export enum Sizes {
  SM = "sm",
  MD = "md",
  LG = "lg",
}
interface ProgressComponentProps {
  progressValue?: number;
  size?: Sizes;
  extraClasses?: {
    track?: string;
  };
}

const ProgressComponent = ({ progressValue, size, extraClasses }: ProgressComponentProps) => {
  return (
    <Progress
      size={size ?? Sizes.MD}
      radius="none"
      aria-labelledby="progress"
      value={progressValue ?? 0}
      classNames={{
        indicator: "bg-white",
        track: `${extraClasses?.track}`
      }}
    />
  );
};

export default ProgressComponent;
