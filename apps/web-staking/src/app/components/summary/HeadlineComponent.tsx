import { PoolInfo } from "@/types/Pool";
import { SecondaryButton } from "../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { InfoMark, Key, PieChart } from "../icons/IconsComponent";
import moment from "moment";


function OnwerUnstakeInfo({ pool }: { pool: PoolInfo }) {
  if (pool.ownerLatestUnstakeRequestCompletionTime >= Date.now()) {
    return <div className="w-full h-fit">
      <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
        <span className="mx-2">
          <Key fill="#C36522" />
        </span>
        <div className="text-[#ED5F00]">
          <div className="text-small font-bold">The pool owner has initiated an unstake request for their genesis key.</div>
          <div
            className="text-sm">{moment.duration(pool.ownerLatestUnstakeRequestCompletionTime - Date.now()).humanize()} remaining
            until genesis key is claimable.
          </div>
        </div>
      </div>
    </div>
  }

  if (pool.ownerStakedKeys == 0) {
    return <div className="w-full h-fit">
      <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
        <span className="mx-2">
          <Key fill="#C36522" />
        </span>
        <div className="text-[#ED5F00]">
          <div className="text-small font-bold">This pool owner has unstaked all of their keys from the pool. They may no longer be operating the keys in this pool and the pool may no longer be generating rewards.</div>
        </div>
      </div>
    </div>
  }

  if (pool.ownerStakedKeys == pool.ownerRequestedUnstakeKeyAmount) {
    return <div className="w-full h-fit">
      <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
        <span className="mx-2">
          <Key fill="#C36522" />
        </span>
        <div className="text-[#ED5F00]">
          <div className="text-small font-bold">This pool owner can unstake all of their keys from the pool at any time. They may no longer be operating the keys in this pool and the pool may no longer be generating rewards.</div>
        </div>
      </div>
    </div>
  }

  return "";

}


const HeadlineComponent = ({ poolInfo, walletAddress, isBannedPool }: { poolInfo: PoolInfo, walletAddress: `0x${string}` | undefined, isBannedPool: boolean }) => {
  const router = useRouter();
  moment.relativeTimeThreshold('d', 61);
  return (
    <div className="w-full">
      {poolInfo.owner === walletAddress && (
        <div className="flex sm:flex-col lg:flex-row w-full lg:items-center sm:items-start justify-between bg-crystalWhite py-2 lg:pl-6 sm:pl-2 pr-4 rounded-lg">
          <span className="flex justify-between items-center text-graphiteGray sm:mb-2 lg:mb-0">
            <InfoMark width={20} height={20} />
            <span className="ml-2">You are the owner of this pool</span>
          </span>
          <div className="w-fit flex sm:flex-row-reverse lg:flex-row items-center gap-2">
            <SecondaryButton
              btnText="Edit reward breakdown"
              onClick={() => router.push(`/pool/${poolInfo.address}/editRewards`)}
              className="border-1 bg-white lg:mr-4 sm:mr-1"
              isDisabled={poolInfo.owner !== walletAddress}
            />
            <SecondaryButton
              btnText="Edit pool details"
              onClick={() => router.push(`/pool/${poolInfo.address}/editDetails`)}
              className="border-1 bg-white"
              isDisabled={poolInfo.owner !== walletAddress}
            />
          </div>
        </div>
      )}

      <OnwerUnstakeInfo pool={poolInfo} />

      <div className="w-full h-fit">
        {(poolInfo.updateSharesTimestamp >= Date.now()) &&
          <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
            <span className="mx-2">
              <PieChart fill="#C36522" />
            </span>
            <div className="text-[#ED5F00]">
              <div className="text-small font-bold">The pool owner has changed the rewards to allocate {poolInfo.pendingShares[0]}%/{poolInfo.pendingShares[1]}%/{poolInfo.pendingShares[2]}% to Owner/Keys/esXAI</div>
              <div
                className="text-sm">{moment.duration(poolInfo.updateSharesTimestamp - Date.now()).humanize()} remaining
                until changes take effect.
              </div>
            </div>
          </div>
        }
        {isBannedPool &&
          <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
            <span className="mx-2">
              <InfoMark fill="#C36522" width={20} height={20} />
            </span>
            <div className="text-[#ED5F00]">
              <div className="text-small font-bold">This pool has been restricted due to a violation of the terms of agreement. Users can unstake from this pool but cannot add more stake.</div>
            </div>
          </div>
        }
      </div>

    </div>
  );
};

export default HeadlineComponent;
