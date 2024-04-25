"use client";
import { OrderedRedemptions, getNetwork, RedemptionFactor, getRedemptions, getWeiAmountFromTextInput } from "@/services/web3.service";
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
import { SwitchArrows } from "../icons/IconsComponent";
import { CURRENCY } from "./Constants";
import { useGetBalanceHooks } from "@/app/hooks/hooks";
import AgreeModalComponent from "../modal/AgreeModalComponents";
import { BorderWrapperComponent } from "@/app/components/borderWrapper/BorderWrapperComponent";
import AvailableBalanceRedeemComponent from "@/app/components/redeem/AvailableBalanceRedeemComponent";
import RedeemWarning from "@/app/components/redeem/RedeemWarning";

export default function RedeemComponent() {
	const { open, close } = useWeb3Modal();
	const { address, chainId } = useAccount();
	const [redeemFactor, setRedeemFactor] = useState<RedemptionFactor>(100);
	const [balance, setBalance] = useState<number | undefined>();
	const [redemptionHistory, setRedemptionHistory] = useState<OrderedRedemptions>({ open: [], closed: [], claimable: [] });
	const [review, setReview] = useState<boolean>();
	const [redeemValue, setRedeemValue] = useState<string>('');
	const [redeemValueWei, setRedeemValueWei] = useState<string>('');
	const [receiveValue, setReceiveValue] = useState<string>((Number(redeemValue) * (redeemFactor / 100)).toString());
	const [currency, setCurrency] = useState<CURRENCY>(CURRENCY.XAI);
	const [refreshBalance, setRefreshBalance] = useState(false);

	const { xaiBalance, esXaiBalance, xaiBalanceWei, esXaiBalanceWei } = useGetBalanceHooks(refreshBalance);

	const onRedemptionPeriodChange = (event: ChangeEvent) => {
		const { value } = event.target as HTMLInputElement
		const newFactor = Number(value);
		setRedeemFactor(newFactor as RedemptionFactor);
		setReceiveValue((Number(redeemValue) * newFactor / 100).toString());
	};

	const onRedeemValueChange = (event: ChangeEvent) => {
		event.preventDefault();
		const { value } = event.target as HTMLInputElement
		if (value.length > 16) {
			return;
		}
		setRedeemValue(value);
		setRedeemValueWei(getWeiAmountFromTextInput(value));
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
		const amountWei = currency === CURRENCY.XAI ? xaiBalanceWei : esXaiBalanceWei
		setRedeemValue((amount).toString());
		setRedeemValueWei(amountWei);
		setReceiveValue((amount * (redeemFactor / 100)).toString());
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

		getRedemptions(getNetwork(chainId), address!)
			.then(orderedRedemptions => {
				setRedemptionHistory(orderedRedemptions);
				reloadRedemptions(++count);
			});
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
	const onRefresh = () => {
		setRedeemFactor(100)
		setRedeemValue("")
		setRedeemValueWei("")
		setReceiveValue("0")
		setReview(false);
		setRefreshBalance(!refreshBalance);
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
					amountWei={redeemValueWei}
					factor={redeemFactor}
					onReturn={() => setReview(false)}
					onRefresh={onRefresh}
					fromCurrency={currency}
				/>
			</>
			:
			<main className="flex w-full flex-col items-center">
				<AgreeModalComponent address={address} />
				<div className="flex flex-col items-start">
					<MainTitle title={"Redeem"} classNames="pl-2 ml-1" />
					{currency === CURRENCY.XAI && <RedeemWarning />}
					<div className="flex flex-col p-3 w-xl">
						<div className="w-xl min-w-md">
							<BorderWrapperComponent customStyle="!mb-1">
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
								<AvailableBalanceRedeemComponent
									balance={balance}
									currency={currency}
									onSelectMaxAmount={onSelectMaxAmount}
								/>
							</BorderWrapperComponent>
							<div className="relative z-10 mt-custom-17 flex justify-center">
								<span onClick={onToggleClick}>
									<SwitchArrows width={36} height={36} fill="#171717"
										className="cursor-pointer p-2 border rounded-full bg-white" />
								</span>
							</div>
							<BorderWrapperComponent>
								<CustomInput
									label="You receive"
									placeholder="0"
									value={isNaN(Number(receiveValue)) ? "0" : receiveValue}
									endContent={<RightRedeemComponent
										currency={currency === CURRENCY.XAI ? CURRENCY.ES_XAI : CURRENCY.XAI} />}
								/>
								<span className="block h-[24px]" />
							</BorderWrapperComponent>
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
									className="w-full disabled:opacity-50 mb-[50px]"
									isDisabled={checkDisabledButton}
								/>
							)}
						</div>
						{<History redemptions={redemptionHistory} reloadRedemptions={reloadRedemptions} />}
					</div>
				</div>
			</main>
		}
	</>);
}
