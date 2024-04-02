import { Progress } from '@nextui-org/progress';

interface ProgressComponentProps {
  progressValue?: number;
}

const ProgressComponent = ({ progressValue }: ProgressComponentProps) => {
  return (
	<Progress
        size="md"
        radius="none"
        aria-labelledby='progress'
        value={progressValue ?? 0}
        classNames={{
          indicator: "bg-red"
        }}
	/>
  );
};

export default ProgressComponent;
