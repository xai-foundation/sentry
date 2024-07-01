import { PoolInfo } from "@/types/Pool";
import { useRouter } from "next/navigation";
import { InfoMark, Key, PieChart } from "../icons/IconsComponent";
import moment from "moment";
import { BaseCallout } from "@/app/components/ui";
import { TextButton } from "@/app/components/ui/buttons";


function OwnerUnstakeInfo({ pool, ownerLatestUnstakeRequestCompletionTime }: { pool: PoolInfo, ownerLatestUnstakeRequestCompletionTime: number }) {
  if (ownerLatestUnstakeRequestCompletionTime >= Date.now()) {
    return <div className="ml-2 mr-2 lg:mr-[23px]">
      <BaseCallout extraClasses={{ calloutWrapper: "w-full min-h-[84px] my-2", calloutFront: "!py-0 min-h-[84px]" }}
                   isWarning>
        <div className="w-full flex justify-start gap-3">
        <span className="mx-2 mt-2">
          <Key fill="#FFC53D" width={25} height={24} />
        </span>
          <div className="text-[#FFC53D] text-lg">
            <div className="font-bold">The pool owner has initiated an unstake request for their genesis key.</div>
            <div
              className="">{moment.duration(ownerLatestUnstakeRequestCompletionTime - Date.now()).humanize()} remaining
              until genesis key is claimable.
            </div>
          </div>
        </div>
      </BaseCallout>
    </div>
  }

  if (pool.ownerStakedKeys == 0) {
    return <div className="ml-2 mr-2 lg:mr-[23px]">
    <BaseCallout
      extraClasses={{ calloutWrapper: "w-full min-h-[84px] my-2", calloutFront: "!py-0" }}
      isWarning
    >
      <div className="my-5 rounded-md flex items-center justify-start gap-3 w-full text-[#FFC53D]">
        <Key fill="#FFC53D" width={25} height={24} />
        <div>
        <span className="block text-lg font-bold">The genesis key has been claimed by the pool owner.
        </span>
          <span className="block text-lg font-medium">The pool owner no longer has any keys staked in the pool.
        </span>
        </div>
      </div>
    </BaseCallout>
  </div>;
  }

  if (pool.ownerStakedKeys == pool.ownerRequestedUnstakeKeyAmount) {
    return <div className="ml-2 mr-2 lg:mr-[23px]">
      <BaseCallout
        extraClasses={{ calloutWrapper: "w-full min-h-[84px] my-2", calloutFront: "!py-0, min-h-[84px]" }}
        isWarning>
        <div className="w-full flex items-center justify-start gap-3">
        <span>
          <Key fill="#FFC53D" width={25} height={24} />
        </span>
          <div className="text-bananaBoat">
            <div className="text-lg font-bold">This pool owner can unstake all of their keys from the pool at any time. They may no
              longer be operating the keys in this pool and the pool may no longer be generating rewards.
            </div>
          </div>
        </div>
      </BaseCallout>
    </div>
  }

  return "";

}


const HeadlineComponent = (
  { poolInfo, walletAddress, isBannedPool, ownerLatestUnstakeRequestCompletionTime }:
    { poolInfo: PoolInfo, walletAddress: `0x${string}` | undefined, isBannedPool: boolean, ownerLatestUnstakeRequestCompletionTime: number }) => {
  const router = useRouter();
  moment.relativeTimeThreshold('d', 61);
  return (
    <div className="w-full">
      {poolInfo.owner === walletAddress && (
        <div
          className="flex sm:flex-col lg:flex-row w-full lg:items-center sm:items-start justify-between bg-nulnOil/75 md:py-[5px] pb-0 pt-[18px] shadow-default mb-4">
          <span
            className="flex w-full max-w-fit justify-between items-center text-graphiteGray sm:mb-[14px] lg:mb-0 mx-[17px] md:mx-[24px]">
            <InfoMark width={20} height={20} />
            <span
              className="ml-2 text-elementalGrey text-lg font-medium ">You are the owner of this pool.</span>
          </span>
          <div className="w-full flex lg:flex-row flex-col justify-end md:gap-2 gap-0">
            <TextButton
              onClick={() => router.push(`/pool/${poolInfo.address}/editRewards`)}
              buttonText={"Edit reward breakdown"}
              className="text-lg font-bold uppercase border-t-1 lg:border-t-0 border-chromaphobicBlack lg:max-w-fit max-w-full w-full text-center"
              textClassName="mr-0"
              isDisabled={poolInfo.owner !== walletAddress}
            />
            <TextButton
              buttonText="Edit pools details"
              onClick={() => router.push(`/pool/${poolInfo.address}/editDetails`)}
              className="text-lg font-bold uppercase border-t-1 lg:border-t-0 border-chromaphobicBlack lg:max-w-fit max-w-full w-full text-center lg:pr-4"
              textClassName="mr-0"
              isDisabled={poolInfo.owner !== walletAddress}
            />
          </div>
        </div>
      )}

      <OwnerUnstakeInfo pool={poolInfo} ownerLatestUnstakeRequestCompletionTime={ownerLatestUnstakeRequestCompletionTime} />

      <div className="w-full h-fit">
        {(poolInfo.updateSharesTimestamp >= Date.now()) &&
          <div className="ml-2 mr-2 lg:mr-[23px]">
            <BaseCallout
              extraClasses={{ calloutWrapper: "w-full min-h-[84px]", calloutFront: "!py-0 min-h-[84px]" }}
              isWarning
            >
              <div className="w-full gap-3 flex">
                <div className="mt-2">
                  <PieChart fill="#FFC53D" width={24} height={24} />
                </div>
                <div className="text-[#FFC53D] text-lg ml-3">
                  <div className="font-bold">The pool owner has changed the rewards to
                    allocate {poolInfo.pendingShares[0]}%/{poolInfo.pendingShares[1]}%/{poolInfo.pendingShares[2]}% to
                    Owner/Keys/esXAI
                  </div>
                  <div
                    className="">{moment.duration(poolInfo.updateSharesTimestamp - Date.now()).humanize()} remaining
                    until changes take effect.
                  </div>
                </div>
              </div>
            </BaseCallout>
          </div>
        }
        {isBannedPool &&
          <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
            <span className="mx-2">
              <InfoMark fill="#C36522" width={20} height={20} />
            </span>
            <div className="text-[#ED5F00]">
              <div className="text-small font-bold">This pool has been restricted due to a violation of the terms of
                agreement. Users can unstake from this pool but cannot add more stake.
              </div>
            </div>
          </div>
        }
      </div>

    </div>
  );
};

export default HeadlineComponent;
