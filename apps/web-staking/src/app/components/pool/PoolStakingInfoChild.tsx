import React from "react";
import TableTooltip from "../ui/tooltips/TableTooltip";
import { HelpIcon } from "../icons/IconsComponent";

interface PoolStakingInfoChildProps {
  title: string;
  content: string;
  toolTipText?: string;
  toolTipClasses?: Record<string, string>;
  showOnClick?: boolean;
  customClass?: string;
}

const PoolStakingInfoChild = ({
  title,
  content,
  toolTipText,
  toolTipClasses,
  customClass
}: PoolStakingInfoChildProps) => {
  return (
    <div className={`pb-[15px] mt-[15px] min-w-32 ${customClass}`}>
      <div className="flex items-center">
      <span className="block text-elementalGrey text-lg font-medium">{title}</span>
            {toolTipText
            && toolTipText.length > 0 
            && <TableTooltip
              extraClasses={toolTipClasses}
              content={toolTipText}
              delay={15000}
            >
              <div className="pt-0 ml-1">
              <HelpIcon
                width={14}
                height={14} />
                </div>
            </TableTooltip>
            }</div>
      <span className="block text-xl font-semibold">{content}</span>
    </div>
  );
};

export default PoolStakingInfoChild;
