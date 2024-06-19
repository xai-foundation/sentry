import React from "react";
import { CopyIcon, HelpIcon } from "@/app/components/icons/IconsComponent";
import { BaseCallout, Tooltip } from "@/app/components/ui";

const SummaryAddress = ({ delegateAddress }: { delegateAddress: string }) => {

  return (
    <div className="relative max-w-[320px]">
      <Tooltip
        content={"This is the address that will operate keys in this pool for assertions and claims."}
        extraClasses={
          { group: "!absolute right-[20px] z-[10000] top-[50%] -translate-y-[50%]" }
        }
      >
        <HelpIcon />
      </Tooltip>
      <Tooltip
        content={"Copied"}
        delay={2000}
        onClickEvent={() => navigator.clipboard.writeText(delegateAddress)}
        showOnClick
        extraClasses={
          { group: "!absolute right-[45px] z-[10000] top-[50%] -translate-y-[50%]" }
        }
      >
        <CopyIcon />
      </Tooltip>
      <BaseCallout
        extraClasses={{
          calloutWrapper: "w-full max-w-[320px] h-[48px]",
          calloutFront: "!justify-start !bg-dynamicBlack"
        }}
        withOutSpecificStyles
      >
      <span className="text-elementalGrey font-medium text-lg mr-2">
        Delegate address:
      </span>
        <span className="text-white">
        {delegateAddress ? `${delegateAddress.slice(0, 6)}...${delegateAddress.slice(-4)}` : "..."}
      </span>
      </BaseCallout>
    </div>
  );
};

export default SummaryAddress;
