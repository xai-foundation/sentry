import React, { useState } from "react";
import questionIcon from "../../icons/questionIcon.png";
import greenIcon from "../../icons/greenIcon.png";
import Image from "next/image";
import CustomPopover from "../../popovers/PopoversComponents";
import { Snippet, Tooltip } from "@nextui-org/react";
import { CopyIcon } from "@/app/components/icons/IconsComponent";

const SummaryAddress = ({ delegateAddress }: { delegateAddress: string }) => {
  const [openTooltip, setOpenTooltip] = useState(false);
  const [copyIcon, setCopyIcon] = useState(CopyIcon());

  return (
    <div className="flex items-center lg:flex-row mt-4 w-full bg-crystalWhite px-6 py-4 rounded-xl">
      <span className="text-lightBlackDarkWhite font-medium mr-2">
        Delegate address:
      </span>
      <span className="text-graphiteGray">
        {delegateAddress ? `${delegateAddress.slice(0, 6)}...${delegateAddress.slice(-4)}` : "..."}
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
            codeString={delegateAddress}
            disableTooltip
            hideSymbol
            timeout={0}
            copyIcon={copyIcon}
            checkIcon={copyIcon}
            onMouseOver={() => setCopyIcon(CopyIcon("#4A4A4A"))}
            onMouseLeave={() => setCopyIcon(CopyIcon())}
            symbol=""
            onCopy={() => {
              setOpenTooltip(true);
              setTimeout(() => {
                setOpenTooltip(false);
              }, 2000);
            }}
            classNames={{
              base: "bg-crystalWhite text-graphiteGray p-0 gap-0"
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
