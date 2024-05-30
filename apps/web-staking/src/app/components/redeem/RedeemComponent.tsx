"use client";
import {
	getNetwork,
	getRedemptions,
	getWeiAmountFromTextInput,
	OrderedRedemptions,
	RedemptionFactor
} from "@/services/web3.service";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import MainTitle from "../titles/MainTitle";
import History from "./History";
import ReviewRedemptionComponent from "./ReviewRedemptionComponent";
import RedemptionPeriod from "./RedemptionPeriod";
import { ExchangeIcon } from "../icons/IconsComponent";
import { CURRENCY } from "./Constants";
import { useGetBalanceHooks } from "@/app/hooks/hooks";
import AgreeModalComponent from "../modal/AgreeModalComponents";
import RedeemWarning from "@/app/components/redeem/RedeemWarning";
import { PrimaryButton, StakingInput } from "@/app/components/ui";
import { ConnectButton } from "@/app/components/ui/buttons";

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
	// not sure if we need this because 17 digits it's a limit for now.

	const checkForError = () => {
		if (balance) {
			return balance < +redeemValue;
		}
	};


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
			<main className="flex w-full flex-col items-center lg:p-0 xl:ml-[-122px] lg:ml-[-61px] ">
				<AgreeModalComponent address={address} />
				<div className="flex flex-col items-start">
					<MainTitle title={"Redeem"} classNames="!mb-10 pl-4 md:pl-0" />

					<div className="w-full max-w-[506px] bg-nulnOil/75 py-[15px] md:px-[25px] px-[15px] relative shadow-default">
						{currency === CURRENCY.XAI && <RedeemWarning />}
						<StakingInput
							value={redeemValue}
							label={"You redeem"}
							currencyLabel={currency}
							onChange={onRedeemValueChange}
							withIcon
							error={checkForError() ? { message: `Not enough ${currency}`, flag: true } : {}}
							availableBalance={balance?.toString().match(/^-?\d+(?:\.\d{0,4})?/) || ""}
							handleMaxValue={onSelectMaxAmount}
							extraClasses={{
								calloutWrapper: `${currency === CURRENCY.XAI ? "mt-4" : "mt-1"} md:h-[160px] h-[170px] bg-foggyLondon`,
								calloutFront: "bg-[#1A1616]",
								input: "placeholder:text-foggyLondon",
								label: "text-white"
							}}
						/>
						<div
							className="flex w-full justify-center my-3 relative">
							<span
								onClick={onToggleClick}
								className={` cursor-pointer
								before:content[''] before:w-full md:before:max-w-[225px] before:max-w-[160px] before:h-[1px] before:bg-chromaphobicBlack before:absolute md:before:left-[-25px] before:left-[-15px] before:top-2/4
								after:content[''] after:w-full md:after:max-w-[225px] after:max-w-[160px] after:h-[1px] after:bg-chromaphobicBlack after:absolute md:after:right-[-25px] after:right-[-15px] after:top-2/4
								`}>
								{ExchangeIcon()}
							</span>
						</div>
						<StakingInput
							value={receiveValue ? receiveValue : "0"}
							label={"You receive"}
							disabled
							withIcon
							error={checkForError() ? { flag: true } : {}}
							currencyLabel={currency === CURRENCY.XAI ? CURRENCY.ES_XAI : CURRENCY.XAI}
							extraClasses={{
								calloutWrapper: "!h-[110px] !py-0 bg-foggyLondon",
								calloutFront: "bg-[#1A1616] !pb-0 !pt-[5px]",
								inputWrapper: "!pb-0",
								label: "text-white"
							}}
						/>

						{currency === CURRENCY.ES_XAI && <RedemptionPeriod
							value={redeemFactor.toString()}
							onChange={onRedemptionPeriodChange}
						/>}
					</div>

					<div className="flex flex-col w-xl w-full">

						<div className="w-full shadow-default">
							{!address && (
								<ConnectButton
									onOpen={open}
									address={address}
									size="md"
									isFullWidth
									extraClasses="w-full disabled:opacity-50 mb-[50px] uppercase !clip-path-12px"
								/>
							)}
							{address && (
								<PrimaryButton
									onClick={() => setReview(true)}
									btnText="Continue"
									className="w-full disabled:!text-dugong mb-[50px] uppercase"
									wrapperClassName="w-full"
									isDisabled={checkDisabledButton}
								/>
							)}
						</div>
						{<History
							redemptions={redemptionHistory}
							reloadRedemptions={reloadRedemptions}
						/>}
					</div>
				</div>
			</main>
		}
	</>);
}
