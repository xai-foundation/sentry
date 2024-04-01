import { useState } from "react";
import { ButtonBack, PrimaryButton } from "../buttons/ButtonsComponent";
import { StakingInput } from "../input/InputComponent";
import { useGetMaxKeyPerPool, useGetUnstakedNodeLicenseCount } from "@/app/hooks/hooks";
import MainTitle from "../titles/MainTitle";
import AvailableBalanceComponent from "../stake/AvailableBalanceComponent";
import { PoolInfo } from "@/types/Pool";
import { Avatar } from "@nextui-org/react";
import StakeKeysDetailReviewComponent from "./StakeKeysDetailReviewComponent";
import WarningComponent from "@/app/components/createPool/WarningComponent";

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
	const [checkbox, setCheckbox] = useState(unstakeKey ? true : false); // only show and require checkbox when staking
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

	const isInvalidInput = () => {
		if (unstakeKey) {
			return Number(inputValue) > getMaxKeysForUnstake();
		}
		return Number(inputValue) > getMaxKeysForStake();
	};

	const confirmButtonDisabled = () => {
		return !address || !inputValue || Number(inputValue) <= 0 || isInvalidInput() || !checkbox;
	}

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
						<>
							{!unstakeKey && (
								<div className="max-w-xl w-full p-3">
									<WarningComponent
										title="By staking keys with this pool, you will give the pool the ability to operate your keys and perform assertions and claims"
										description="Your key’s rewards will be distributed to the staking pool, and the pools reward tiers will apply to your key"
										checkboxText="I agree to allow the pool to operate my keys and perform assertions and claims with my keys"
										onAcceptTerms={() => { }}
										includeYouMustAgreeMessage={true}
										checkbox={checkbox}
										setCheckbox={setCheckbox}
									/>
								</div>
							)}

							<div className="flex items-center mb-4">
								<span className="mr-2">{unstakeKey ? 'Unstake from:' : 'Stake to:'}</span>
								<Avatar src={userPool.meta.logo} className="w-[32px] h-[32px] mr-2" />
								<span className="text-graphiteGray">{userPool.meta.name}</span>
							</div>
						</>
					}

					<StakingInput
						value={inputValue}
						label={unstakeKey ? "You unstake" : "You stake"}
						placeholder="0"
						onChange={handleChange}
						isInvalid={isInvalidInput()}
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
						isDisabled={confirmButtonDisabled()}
					/>
				</div>
			)}
		</>
	);
};
