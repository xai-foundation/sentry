import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { InfoMark } from "../icons/IconsComponent";
import { useGetMaxStakePerLicense } from "@/app/hooks/hooks";

const TOKEN_TRACKER_TEXT =
  "When people stake in your pool they will receive a tracker token to represent their stake. The tracker name and ticker are how his token will appear in their wallet and on block explorers like Arbiscan";
const STAKING_TEXT =
  "Your staking capacity is dependent on how many keys you own. Each key will increase your staking capacity by ##MAXSTAKE## esXAI.";
export interface PopoverWindowProps {
  customClass?: string;
  width?: number;
  height?: number;
  start?: boolean;
  small?: boolean;
  tokenText?: boolean;
}

const PopoverWindow = ({
  customClass,
  width = 20,
  height = 20,
  start,
  small,
  tokenText,
}: PopoverWindowProps) => {
  const [openPopover, setOpenPopover] = useState(false);
  const { maxStakePerKey } = useGetMaxStakePerLicense();

  return (
    <Popover
      placement={`${start ? "bottom-start" : "bottom-end"}`}
      showArrow={true}
      shadow="md"
      isOpen={openPopover}
    >
      <PopoverTrigger>
        {
          <span
            onMouseOver={() => {
              setOpenPopover(true);
            }}
            onMouseOut={() => {
              setOpenPopover(false);
            }}
            className={`ml-1 ${customClass}`}
          >
            <InfoMark width={small ? 12 : width} height={small ? 12 : height} />
          </span>
        }
      </PopoverTrigger>
      <PopoverContent className="lg:w-[400px] sm:w-[340px] h-[120px] p-3 text-base text-graphiteGray">
        {tokenText ? TOKEN_TRACKER_TEXT : STAKING_TEXT.replace("##MAXSTAKE##", maxStakePerKey.toString())}
      </PopoverContent>
    </Popover>
  );
};

export default PopoverWindow;
