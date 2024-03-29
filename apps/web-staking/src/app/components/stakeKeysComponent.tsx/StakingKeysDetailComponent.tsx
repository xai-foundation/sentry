import { useState } from "react";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import { useGetMaxKeyPerPool, useGetUnstakedNodeLicenseCount } from "@/app/hooks/hooks";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "../stake/AvailableBalanceComponent";
import { PoolInfo } from "@/types/Pool";
import { Avatar } from "@nextui-org/react";
import StakeKeysDetailReviewComponent from "./StakeKeysDetailReviewComponent";

interface StakePoolKeytProps {
	userPool: PoolInfo;
	address: string | undefined;
	onBack: () => void;
	unstakeKey: boolean;
}

export default function StakingKeysDetailComponent({
	userPool,
	address,
	onBack,
	unstakeKey
}: StakePoolKeytProps) {
	const [inputValue, setInputValue] = useState("");
	const [reviewVisible, setReviewVisible] = useState(false);
	const { unstakedKeyCount } = useGetUnstakedNodeLicenseCount();
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const roundNum = Math.round(Number(e.target.value));
		setInputValue(roundNum.toString());
	};

	const { maxKeyPerPool } = useGetMaxKeyPerPool();

	const getMaxKeysForUnstake = () => {

		let unstakeCount = userPool.userStakedKeyIds.length - (userPool.unstakeRequestkeyAmount || 0);
		if (unstakeCount == 0) {
			return 0;
		}
		if (address == userPool.owner) {
			if (unstakeCount != 1) {
				//Owner can only unstake up to 1 key and has to do a dedicated request for the last key
				unstakeCount -= 1;
			}
		}
		return Math.min(100, unstakeCount);
	}

	const getMaxKeysForStake = (): number => {
		return Math.min(100, unstakedKeyCount, maxKeyPerPool - userPool.keyCount)
	}

	const validationInput = () => {
		if (unstakeKey) {
			return Number(inputValue) > getMaxKeysForUnstake();
		}
		return Number(inputValue) > getMaxKeysForStake();
	};

	const checkDisabledButton =
		!address || !inputValue || Number(inputValue) <= 0 || validationInput();

	return (
		<>
			{reviewVisible ? (
				<StakeKeysDetailReviewComponent
					pool={userPool}
					onBack={() => setReviewVisible(false)}
					inputValue={inputValue}
					unstake={unstakeKey}
				/>
			) : (
				<div className="flex flex-col items-start">
					<ButtonBack onClick={onBack} btnText="Back" />
					<MainTitle title={unstakeKey ? "Unstake keys" : "Stake keys"} />

					{userPool &&
						<div className="flex items-center mb-4">
							<span className="mr-2">{unstakeKey ? 'Unstake from:' : 'Stake to:'}</span>
							<Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
							<span className="text-graphiteGray">{userPool.meta.name}</span>
						</div>
					}

					<StakingInput
						value={inputValue}
						label={unstakeKey ? "You unstake" : "You stake"}
						placeholder="0"
						onChange={handleChange}
						isInvalid={validationInput()}
						keys
						endContent={
							<AvailableBalanceComponent
								currency="Sentry Key"
								keyBalance={unstakeKey ? getMaxKeysForUnstake() : getMaxKeysForStake()}
								onMaxBtnClick={() => setInputValue(unstakeKey ? String(getMaxKeysForUnstake()) : String(getMaxKeysForStake()))}
								customClass="sm:text-3xl lg:text-4xl"
							/>
						}
					/>
					<PrimaryButton
						onClick={() => {
							setReviewVisible(true);
						}}
						btnText="Continue"
						className="w-full disabled:opacity-50"
						isDisabled={checkDisabledButton}
					/>
				</div>
			)}
		</>
	);
};