import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import Image, { StaticImageData } from "next/image";

export interface PopoverWindowProps {
  text: string;
  icon: StaticImageData;
  customClass?: string;
  position: "top" | "bottom" | "left" | "right" | "bottom-end" | "bottom-start";
  width?: number;
  height?: number;
  start?: boolean;
}

const CustomPopover = ({
  customClass,
  width = 20,
  height = 20,
  position = "top",
  text,
  icon,
}: PopoverWindowProps) => {
  const [openPopover, setOpenPopover] = useState(false);

  return (
    <Popover
      placement={position}
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
            className={`${customClass}`}
          >
            <Image
              src={icon}
              width={width}
              height={height}
              alt=""
            />
          </span>
        }
      </PopoverTrigger>
      <PopoverContent className="p-3 text-base text-graphiteGray">
        {text}
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;
