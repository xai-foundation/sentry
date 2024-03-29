import React, { useState } from "react";
import questionIcon from "../../icons/questionIcon.png";
import documentIcon from "../../icons/documentIcon.png";
import greenIcon from "../../icons/greenIcon.png";
import Image from "next/image";
import CustomPopover from "../../popovers/PopoversComponents";
import { Snippet, Tooltip } from "@nextui-org/react";
import { PoolInfo } from "@/types/Pool";

const SummaryAddress = ({ poolInfo }: { poolInfo: PoolInfo }) => {
  const [openTooltip, setOpenTooltip] = useState(false);

  return (
    <div className="flex items-center lg:flex-row mt-4 w-full bg-crystalWhite px-6 py-4 rounded-xl">
      <span className="text-lightBlackDarkWhite font-medium mr-2">
        Delegate address:
      </span>
      <span className="text-graphiteGray">
        {`${poolInfo?.owner.slice(0, 6)}...${poolInfo?.owner.slice(-4)}`}
      </span>
      <div>
        <Tooltip
          isOpen={openTooltip}
          content={
            <div className="flex items-center gap-2 p-1">
              <Image src={greenIcon} width={16} height={15} alt="" />
              <span className="text-graphiteGray">Copied!</span>
            </div>
          }
          closeDelay={500}
          showArrow={true}
          placement="bottom-end"
        >
          <Snippet
            codeString={poolInfo?.owner}
            disableTooltip
            hideSymbol
            timeout={0}
            copyIcon={
              <Image src={documentIcon} width={16} height={15} alt="" />
            }
            checkIcon={
              <Image src={documentIcon} width={16} height={15} alt="" />
            }
            symbol=""
            onCopy={() => {
              setOpenTooltip(true);
              setTimeout(() => {
                setOpenTooltip(false);
              }, 2000);
            }}
            classNames={{
              base: "bg-crystalWhite text-graphiteGray p-0 gap-0",
            }}
          ></Snippet>
        </Tooltip>
      </div>
      <CustomPopover
        text="This is the address that will operate the keys in this pool for assertions and claims."
        icon={questionIcon}
        position="bottom-start"
      />
    </div>
  );
};

export default SummaryAddress;
