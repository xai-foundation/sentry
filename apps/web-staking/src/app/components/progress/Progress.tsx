import { Progress } from "@nextui-org/progress";

export enum Sizes {
  SM = "sm",
  MD = "md",
  LG = "lg",
}
interface ProgressComponentProps {
  progressValue?: number;
  size?: Sizes;
}

const ProgressComponent = ({ progressValue, size }: ProgressComponentProps) => {
  return (
    <Progress
      size={size ?? Sizes.MD}
      radius="none"
      aria-labelledby="progress"
      value={progressValue ?? 0}
      classNames={{
        indicator: "bg-red",
      }}
    />
  );
};

export default ProgressComponent;
