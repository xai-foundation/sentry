"use client";
import { OrderedRedemptions, getNetwork, RedemptionFactor, getRedemptions } from "@/services/web3.service";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton, PrimaryButton } from "../buttons/ButtonsComponent";
import { CustomInput } from "../input/InputComponent";
import RightRedeemComponent from "./RightComponent";
import MainTitle from "../titles/MainTitle";
import History from "./History";
import ReviewRedemptionComponent from "./ReviewRedemptionComponent";
import RedemptionPeriod from "./RedemptionPeriod";
import { ErrorCircle, SwitchArrows } from "../icons/IconsComponent";
import { CURRENCY } from "./Constants";
import { useGetBalanceHooks } from "@/app/hooks/hooks";


export default function RedeemComponent() {
	const { open, close } = useWeb3Modal();
	const { address, chainId } = useAccount();
	const { xaiBalance, esXaiBalance } = useGetBalanceHooks();
	const [redeemFactor, setRedeemFactor] = useState<RedemptionFactor>(100);
	const [balance, setBalance] = useState<number | undefined>();
	const [redemptionHistory, setRedemptionHistory] = useState<OrderedRedemptions>({ open: [], closed: [], claimable: [] });
	const [review, setReview] = useState<boolean>();
	const [redeemValue, setRedeemValue] = useState<string>('');
	const [receiveValue, setReceiveValue] = useState<string>((Number(redeemValue) * (redeemFactor / 100)).toString());
	const [currency, setCurrency] = useState<CURRENCY>(CURRENCY.XAI);

	const onRedemptionPeriodChange = (event: ChangeEvent) => {
		const { value } = event.target as HTMLInputElement
		const newFactor = Number(value);
		setRedeemFactor(newFactor as RedemptionFactor);
		setReceiveValue((Number(redeemValue) * newFactor / 100).toString());
	};

	const onRedeemValueChange = (event: ChangeEvent) => {
		const { value } = event.target as HTMLInputElement
		setRedeemValue(value);
		setReceiveValue((Number(value) * (redeemFactor / 100)).toString());
	}

	const onToggleClick = useCallback(() => {
		if (currency === CURRENCY.XAI) {
			setCurrency(CURRENCY.ES_XAI);
			setRedeemFactor(100);

		} else {
			setCurrency(CURRENCY.XAI);
			setReceiveValue(redeemValue);
			setRedeemFactor(100);
		}

	}, [currency, redeemValue]);

	const onSelectMaxAmount = () => {
		const amount = currency === CURRENCY.XAI ? xaiBalance : esXaiBalance
		setRedeemValue((amount).toString());
		setReceiveValue((Number(amount) * (redeemFactor / 100)).toString());
	}

	useEffect(() => {
		setBalance(currency === CURRENCY.XAI ? xaiBalance : esXaiBalance);
	}, [currency, xaiBalance, esXaiBalance]);

	// TODO need to work on history data conversion based on some realtime data
	useEffect(() => {
		if (!address || !chainId) return;
		getRedemptions(getNetwork(chainId), address)
			.then(orderedRedemptions => {
				setRedemptionHistory(orderedRedemptions);
			});
	}, [address, chainId]);


	useEffect(() => {
		if (review === true || review === undefined) return;
		getRedemptions(getNetwork(chainId), address!)
			.then(orderedRedemptions => {
				setRedemptionHistory(orderedRedemptions);
			});
	}, [address, chainId, review]);

	const reloadRedemptions = useCallback((count = 0) => {
		if (!address || !chainId) return;
		if (count > 1) return;

		setTimeout(() => {
			getRedemptions(getNetwork(chainId), address!)
			.then(orderedRedemptions => {
				setRedemptionHistory(orderedRedemptions);
				console.log('redemption reloaded and records are for', orderedRedemptions, count);
				reloadRedemptions(++count);
			});
		}, 4000);
	}, [address, chainId]);

	// useEffect(() => {
	// 	setBalance(currency === CURRENCY.XAI ? xaiBalance : esXaiBalance);
	// }, [xaiBalance, esXaiBalance]);

	const isInvalid = () => {
		if (Number(redeemValue) > (currency === CURRENCY.XAI ? xaiBalance : esXaiBalance)) {
          return true;
		} 
		if (redeemValue.split(".")[1] && redeemValue.split(".")[1].length > 18) {
          return true;
		}
	}

	const checkDisabledButton =
    !address || !redeemValue || Number(redeemValue) <= 0 || isInvalid();
	
	const errorMessage =
    redeemValue.split(".")[1] &&
    redeemValue.split(".")[1].length > 18 ? "Only 18 decimals are allowed" : `Not enough ${currency} in wallet `;


	return (<>
		{review ?
			<>
				<ReviewRedemptionComponent
					receiveValue={receiveValue}
					amount={redeemValue}
					factor={redeemFactor}
					onReturn={() => setReview(false)}
					fromCurrency={currency}
				/>
			</>
			:
			<main className="flex w-full flex-col items-center">
				<div className="flex flex-col items-start">
					<MainTitle title={"Redeem"} classNames="pl-2 ml-1" />
					<div className="flex flex-col p-3 w-xl">
						<div className="w-xl min-w-md">
							<CustomInput
								label="You redeem"
								placeholder="0"
								value={redeemValue}
								type="number"
								onChange={onRedeemValueChange}
								isInvalid={isInvalid()}
								errorMessage={errorMessage}
								endContent={
									<RightRedeemComponent
										currency={currency}
										availableXaiBalance={balance}
										onMaxBtnClick={onSelectMaxAmount}
									/>
								}
							/>
							<div className="relative z-10 mt-custom-17 flex justify-center">
								<span onClick={onToggleClick}>
									<SwitchArrows width={36} height={36} fill="#171717" className="cursor-pointer p-2 border rounded-full bg-white" />
								</span>
							</div>
							<CustomInput
								label="You receive"
								placeholder="0"
								value={isNaN(Number(receiveValue)) ? '0' : receiveValue}
								endContent={<RightRedeemComponent currency={currency === CURRENCY.XAI ? CURRENCY.ES_XAI : CURRENCY.XAI} />}
							/>
						</div>
						{currency === CURRENCY.ES_XAI && <RedemptionPeriod
							value={redeemFactor.toString()}
							onChange={onRedemptionPeriodChange}
						/>}
						<div className="mt-2">
							{!address && (
								<ConnectButton onOpen={open} address={address} isFullWidth />
							)}
							{address && (
								<PrimaryButton
									onClick={() => setReview(true)}
									btnText="Continue"
									className="w-full disabled:opacity-50"
									isDisabled={checkDisabledButton}
								/>
							)}
						</div>
						{<History redemptions={redemptionHistory} reloadRedemptions={reloadRedemptions}/>}
					</div>
				</div>
			</main>
		}
	</>);
}
