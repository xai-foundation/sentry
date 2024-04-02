import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { InfoMark } from "../icons/IconsComponent";

export interface PopoverWindowProps {
  customClass?: string;
  width?: number;
  height?: number;
  start?: boolean;
  small?: boolean;
}

const PopoverWindow = ({
  customClass,
  width = 20,
  height = 20,
  start,
  small,
}: PopoverWindowProps) => {
  const [openPopover, setOpenPopover] = useState(false);

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
      <PopoverContent className="lg:w-[400px] sm:w-[340px] h-[100px] p-3 text-base">
        {
          "Your staking capacity is dependent on how many keys you own. Each key will increase your staking capacity by 25,000 esXAI."
        }
      </PopoverContent>
    </Popover>
  );
};

export default PopoverWindow;
