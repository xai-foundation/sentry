import { PoolInfo, TierInfo } from "@/types/Pool";
import { getIcon } from "../staking/utils";
import { iconType } from "@/app/components/dashboard/constants/constants";

const ListLabel = ({ tier }: { tier: TierInfo & { icon: iconType } }) => {
  return (
    <div className="flex items-center">
      <span className="relative pr-3 pl-9 py-1 rounded-2xl border">
        <span className="absolute lg:top-2 left-3 sm:top-1">
          {tier?.icon && tier?.icon({ width: 16, height: 13.5 })}
        </span>
        {tier?.iconText}
      </span>
    </div>
  );
};

export default ListLabel;
