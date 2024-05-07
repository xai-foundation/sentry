import { WarningIcon } from "../icons/IconsComponents";

interface WarningNotificationProps {
  text: string;
  title: string;
  showIcon?: boolean;
}

const WarningNotification = ({ text, title, showIcon }: WarningNotificationProps) => {
  return (
    <div className="relative w-full sm:max-w-[280px] md:max-w-[360px] lg:max-w-full sm:text-sm bg-bananaBoat text-bananaBoatText pt-[15px] pr-[22px] pb-[25px] pl-[50px] global-cta-clip-path">
      {showIcon && <WarningIcon className="absolute top-[15px] left-[15px]" />}
      <span className="font-bold">{title}</span> <br />
      <span className="text-wrap break-words">{text}</span>
    </div>
  );
};

export default WarningNotification;
