import MainTitle from "@/app/components/titles/MainTitle";
import PoolDetailsComponent from "@/app/components/createPool/PoolDetailsComponent";
import SocialLinksComponent from "@/app/components/createPool/SocialLinksComponent";
import RewardComponent, { Rewards } from "@/app/components/createPool/RewardComponent";
import { useState } from "react";
import {
  ButtonBack,
  PrimaryButton,
  SecondaryButton,
} from "@/app/components/buttons/ButtonsComponent";
import { useRouter } from "next/navigation";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { loadingNotification, updateNotification } from "../notifications/NotificationsComponent";
import { WriteFunctions, executeContractWrite } from "@/services/web3.writes";
import { POOL_SHARES_BASE, getNetwork, getPoolAddressOfUserAtIndex, getPoolsOfUserCount, getUnstakedKeysOfUser, mapWeb3Error } from "@/services/web3.service";
import StakePoolKeyComponent from "./StakePoolKeyComponent";
import { post } from "@/services/requestService";
import DelegateAddressComponent from "./DelegateAddressComponent";

const CreatePoolComponent = () => {
  const router = useRouter();
  const [errorValidationDetails, setErrorValidationDetails] = useState(false);
  const [errorValidationRewards, setErrorValidationRewards] = useState(false);
  const [errorValidationAddress, setErrorValidationAddress] = useState(false);
  const [errorSameWallets, setErrorSameWallets] = useState(false);
  const [showStakePoolKey, setShowStakePoolKey] = useState(false);

  const { address, chainId } = useAccount();
  const [transactionLoading, setTransactionLoading] = useState(false);

  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [poolDetailsValues, setPoolDetailsValues] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });
  const [rewardsValues, setRewardsValues] = useState<Rewards>({
    owner: "",
    keyholder: "",
    staker: "",
  });
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    discord: "",
    telegram: "",
    twitter: "",
    instagram: "",
    youTube: "",
    tiktok: "",
  });
  const [tokenTracker, setTokenTracker] = useState({
    trackerName: "",
    trackerTicker: "",
  });
  const [delegateAddress, setDelegateAddress] = useState("");

  const onConfirm = async (numKeys: number) => {
    setTransactionLoading(true);
    const loading = loadingNotification("Transaction pending...");
    try {
      
      const keyIds = await getUnstakedKeysOfUser(getNetwork(chainId), address as string, numKeys);
      const currentPoolCount = await getPoolsOfUserCount(getNetwork(chainId), address as string);

      const receipt = await executeContractWrite(
        WriteFunctions.createPool,
        [
          delegateAddress,
          keyIds,
          [
            BigInt((Number(rewardsValues.owner) * POOL_SHARES_BASE).toFixed(0)),
            BigInt((Number(rewardsValues.keyholder) * POOL_SHARES_BASE).toFixed(0)),
            BigInt((Number(rewardsValues.staker) * POOL_SHARES_BASE).toFixed(0))
          ],
          [
            poolDetailsValues.name,
            poolDetailsValues.description,
            poolDetailsValues.logoUrl
          ],
          [socialLinks.website, socialLinks.discord, socialLinks.telegram, socialLinks.twitter, socialLinks.instagram, socialLinks.youTube, socialLinks.tiktok],
          [
            [tokenTracker.trackerName, tokenTracker.trackerTicker + "-K",],
            [tokenTracker.trackerName, tokenTracker.trackerTicker + "-X"]
          ],
        ],
        chainId,
        writeContractAsync,
        switchChain
      );

      setTimeout(async () => {
        const newPoolAddress = await getPoolAddressOfUserAtIndex(getNetwork(chainId), address as string, currentPoolCount);
        updateNotification("Pool created", loading, false, receipt, chainId);
        setTransactionLoading(false);

        // Send data to Backend
        await writeToDb(newPoolAddress, chainId);

        router.push(`/pool/${newPoolAddress}/summary`)
      }, 3000);

    } catch (ex: any) {
      const error = mapWeb3Error(ex);
      updateNotification(error, loading, true);
      setTransactionLoading(false);
    }
  }

  // write pool to database
  const writeToDb = async (newPoolAddress: string, chainId: number | undefined): Promise<any> => {
    try {
      await post({
        body: {
          poolAddress: newPoolAddress,
          network: getNetwork(chainId)
        },
        url: "/api/createPool"
      });
    } catch (error: any) {
      console.error('Error creating pool:', error.message);
      return { error: error.message };
    }
  };

  return (
    <>
      {showStakePoolKey ? (
        <div className="flex w-full flex-col items-center lg:px-[350px] sm:px-3">
          <StakePoolKeyComponent
            onConfirm={onConfirm}
            poolDetailsValues={poolDetailsValues}
            onBack={() => setShowStakePoolKey(false)}
            address={address}
            transactionLoading={transactionLoading}
            stakeKey={true}
          />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center md:w-2/3 sm:px-3">
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full border-b-1 mb-2">
            <ButtonBack onClick={() => router.back()} btnText="Back" />
            <MainTitle title={"Create new pool"} />
          </div>
          <div className="sm:py-5 sm:px-0 lg:flex sm:grid sm:flex-col sm:items-center lg:items-start min-w-full">
            <PoolDetailsComponent
              poolDetailsValues={poolDetailsValues}
              setPoolDetailsValues={setPoolDetailsValues}
              setError={setErrorValidationDetails}
              tokenTracker={tokenTracker}
              setTokenTracker={setTokenTracker}
            />

            <RewardComponent
              rewardsValues={rewardsValues}
              setRewardsValues={setRewardsValues}
              setError={setErrorValidationRewards}
            />

            <DelegateAddressComponent
              ownerAddress={address}
              delegateAddress={delegateAddress}
              setDelegateAddress={setDelegateAddress}
              error={errorValidationAddress}
              setError={setErrorValidationAddress}
              setErrorSameWallets={setErrorSameWallets}
            />

            <SocialLinksComponent
              socialLinks={socialLinks}
              setSocialLinks={setSocialLinks}
            />

            <div className="flex flex-row justify-between w-full border-t-1 py-6">
              <SecondaryButton btnText="Cancel" onClick={() => router.back()} />
              <PrimaryButton
                btnText="Save and confirm"
                onClick={() => setShowStakePoolKey(true)}
                className="font-semibold disabled:opacity-50"
                isDisabled={
                  errorValidationDetails ||
                  errorValidationRewards ||
                  errorValidationAddress ||
                  errorSameWallets
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePoolComponent;
