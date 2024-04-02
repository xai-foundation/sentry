import { PoolInfo } from "@/types/Pool";
import { SecondaryButton } from "../buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { ErrorCircle, InfoMark, PieChart } from "../icons/IconsComponent";
import moment from "moment";

const HeadlineComponent = ({ poolInfo, walletAddress }: { poolInfo: PoolInfo, walletAddress: `0x${string}` | undefined }) => {
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
              className="bg-white lg:mr-4 sm:mr-1"
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
      <div className="w-full h-fit">
        {(poolInfo.updateSharesTimestamp >= Date.now()) &&
          <div className="bg-[#ED5F00]/10 p-3 my-5 rounded-md flex items-center justify-start gap-3">
            <span className="mx-2">
              <PieChart />
            </span>
            <div className="text-[#ED5F00]">
              <div className="text-small font-bold">The pool owner has changed the rewards to allocate {poolInfo.pendingShares[0]}%/{poolInfo.pendingShares[1]}%/{poolInfo.pendingShares[2]}% to Owner/Keys/esXai</div>
              <div className="text-tiny">{moment.duration(poolInfo.updateSharesTimestamp - Date.now()).humanize()} remaining until changes take effect.</div>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default HeadlineComponent;
