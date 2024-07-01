import {BiLoaderAlt} from "react-icons/bi";
import {AiFillInfoCircle} from "react-icons/ai";
import {useGetTotalSupplyAndCap} from "@/features/checkout/hooks/useGetTotalSupplyAndCap";
import {Dispatch, SetStateAction, useState} from "react";
import {ethers} from "ethers";
import {CheckoutTierSummary, getPromoCode} from "@sentry/core";
import {PrimaryButton} from "@sentry/ui";
import {KYCTooltip} from "@/features/checkout/KYCTooltip";
import {useNetwork} from 'wagmi';
import MainCheckbox from "@sentry/ui/src/rebrand/checkboxes/MainCheckbox";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import {mapWeb3Error} from "@/utils/errors";

interface PriceDataInterface {
	price: bigint;
	nodesAtEachPrice: Array<CheckoutTierSummary>;
}

interface WebBuyKeysOrderTotalProps {
	onClick: () => void;
	getPriceData: PriceDataInterface | undefined;
	discount: { applied: boolean, error: boolean }
	setDiscount: Dispatch<SetStateAction<{ applied: boolean, error: boolean }>>;
	isPriceLoading: boolean;
	prefilledPromoCode?: string | null;
	promoCode: string;
	setPromoCode: Dispatch<SetStateAction<string>>;
	error: Error | null;
}

export function WebBuyKeysOrderTotal(
	{
		onClick,
		getPriceData,
		discount,
		setDiscount,
		isPriceLoading,
		promoCode,
		setPromoCode,
		error
	}: WebBuyKeysOrderTotalProps) {
	const {isLoading: isTotalLoading} = useGetTotalSupplyAndCap();
	const { chain } = useNetwork()

	const [promo, setPromo] = useState<boolean>(false);
	const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
	const [checkboxTwo, setCheckboxTwo] = useState<boolean>(false);
	const [checkboxThree, setCheckboxThree] = useState<boolean>(false);
	const ready = checkboxOne && checkboxTwo && checkboxThree;

	const handleSubmit = async () => {
		const validatePromoCode = await getPromoCode(promoCode);

		if (validatePromoCode.active) {
			setDiscount({
				applied: true,
				error: false,
			});
		} else {
			setDiscount({
				applied: false,
				error: true,
			});
			setPromoCode("");
		}
	};

	function getKeys() {
		if (!getPriceData || !getPriceData.nodesAtEachPrice) {
			return
		}

		return getPriceData.nodesAtEachPrice
			.filter(item => Number(item.quantity) !== 0)
			.map((item, i) => {
								return (
					<div key={`get-keys-${i}`}>
						<div className="flex sm:flex-col lg:flex-row items-center justify-between text-xl">
							<div className="flex flex-row items-center gap-2 text-white font-semibold">
								<span className="">{item.quantity.toString()} x Xai Sentry Node Key</span>
							</div>
						<p className="text-base text-elementalGrey mb-4 sm:block lg:hidden">
							{ethers.formatEther(item.pricePer)} AETH per key
						</p>
							<div className="flex flex-row items-center gap-1">
								<span
									className="font-bold text-white text-2xl">
									{ethers.formatEther(item.totalPriceForTier)} AETH
								</span>
							</div>
						</div>
						<p className="text-base text-elementalGrey mb-4 sm:hidden lg:block">
							{ethers.formatEther(item.pricePer)} AETH per key
						</p>
					</div>
				);
			});
	}

	const displayPricesMayVary = (getPriceData?.nodesAtEachPrice?.filter((node) => node.quantity !== 0n) ?? []).length >= 2;

	return (
		<div>
			{isPriceLoading || isTotalLoading || !getPriceData
				? (
					<div className="w-full h-[365px] flex flex-col justify-center items-center gap-2">
						<BiLoaderAlt className="animate-spin" color={"#FF0030"} size={32}/>
						<p className="text-base text-white font-semibold">Updating total...</p>
					</div>
				) : (
					<>
						<div className="w-full flex flex-col gap-4">
							<div className="mt-4">
								{getKeys()}

								{discount.applied && (
									<>
										<div className="flex flex-row items-center justify-between text-lg">
											<div className="flex flex-row items-center gap-2">
												<span className="text-white">Discount (5%)</span>

												<a
													onClick={() => setDiscount({applied: false, error: false})}
													className="text-[#F30919] ml-1 cursor-pointer"
												>
													Remove
												</a>

											</div>
											<div className="flex flex-row items-center gap-1">
												<span className="text-white font-semibold">
													{ethers.formatEther(getPriceData.price * BigInt(5) / BigInt(100))} AETH
												</span>
											</div>
										</div>
										<p className="text-[13px] text-elementalGrey ">
											{promoCode}
										</p>
									</>
								)}

								{displayPricesMayVary && (
									<div className="lg:max-w-[575px] md:max-w-[675px] flex flex-col bg-bananaBoat px-5 py-4 gap-2 mb-4">
										<div className="flex items-center gap-2 font-semibold">
											<AiFillInfoCircle className="w-[20px] h-[20px] text-bananaBoatText"/>
											<p className="text-lg text-bananaBoatText">
												Your transaction may be reverted
											</p>
										</div>
										<p className="text-sm text-bananaBoatText">
											Xai Sentry Node Key prices vary depending on the quantity of remaining
											supply. In general, as the quantity of available keys decreases, the price
											of a key will increase. If you purchase more Keys than are available in the
											current pricing tier, the transaction may revert. We recommend splitting the
											purchase into two transactions - one for the current pricing tier and
											another in the next pricing tier.
										</p>
									</div>
								)}

								{/*		Promo section		*/}
								{!discount.applied && (
									<>
										<hr className="my-2 border-[#525252]"/>
										{promo ? (
											<div className="w-full flex flex-col items-center py-2 ">
												<div className="w-full h-auto flex sm:flex-col lg:flex-row sm:justify-center lg:justify-start items-center text-[15px] text-elementalGrey mt-2 sm:mb-2 lg:mb-0">
													<div
														className="w-[300px] h-auto flex flex-row sm:justify-center lg:justify-start items-center text-[15px] text-elementalGrey mt-2 sm:mb-2 lg:mb-0">
														<span
															className="text-[#F30919] text-base">+ Add promo code</span>
														<div
															className="cursor-pointer z-10"
															onClick={() => {
																setPromoCode("");
																setPromo(false);
															}}
														>
															{/* <AiOutlineClose/> */}
														</div>
													</div>

													<div className="flex w-full items-center sm:justify-center">

														<input
															type="text"
															value={promoCode}
															onChange={(e) => {
																setPromoCode(e.target.value)
																setDiscount({
																	applied: false,
																	error: false,
																});
															}}
															className={`text-white lg:w-full border-r-0 p-2 bg-darkLicorice border ${discount.error ? "border-[#AB0914]" : "border-[#525252]"}`}
														/>
														<div className="lg:hidden sm:block">
															<PrimaryButton
																onClick={() => handleSubmit()}
																btnText="APPLY"
																className="text-white text-sm !py-2 max-h-[42.5px] max-w-[90px]"
															/>
														</div>
													</div>
													<div className="lg:block sm:hidden">
														<PrimaryButton
															onClick={() => handleSubmit()}
															btnText="APPLY"
															className="text-white text-sm !py-2 max-h-[42.5px] max-w-[90px]"
														/>
													</div>
												</div>

												{discount.error && (
													<BaseCallout extraClasses={{calloutWrapper: "h-[50px] w-full mt-2"}} isWarning>
														<div className="flex gap-[10px]">
															<span className="block"><WarningIcon /></span>
															<span className="block">
																Invalid referral address
															</span>
														</div>
													</BaseCallout>
												)}
											</div>
										) : (
											<p className="flex sm:justify-center lg:justify-start text-[15px] py-2">
												<a
													onClick={() => setPromo(true)}
													className="text-[#F30919] text-base ml-1 cursor-pointer"
												>
													+ Add promo code
												</a>
											</p>
										)}
									</>
								)}

								<hr className="my-2 border-[#525252]"/>
								<div className="flex sm:flex-col lg:flex-row items-center justify-between py-2">
									<div className="flex flex-row items-center gap-2 sm:text-xl lg:text-2xl">
										<span className="text-white font-bold text-2xl">You pay</span>
									</div>
									<div className="flex flex-row items-center gap-1">
										<span className="text-white font-bold text-3xl">
											{discount.applied
												? ethers.formatEther(getPriceData.price * BigInt(95) / BigInt(100))
												: ethers.formatEther(getPriceData.price)
											}
										</span>
										<span className="text-white font-bold text-3xl">AETH</span>
									</div>
								</div>
							</div>
						</div>
						<hr className="my-2 border-[#525252]"/>
						<div className="flex flex-col justify-center gap-8 mt-8">
							<div className="flex w-full flex-col justify-center gap-2">
								<MainCheckbox
									onChange={() => setCheckboxOne(!checkboxOne)}
									isChecked={checkboxOne}
									labelStyle="!items-start"
								>
									<div className="sm:w-[200px] md:w-[300px] lg:w-auto">
									<span className="sm:text-base text-elementalGrey sm:mr-2">I agree with the</span>
									<a
										className="cursor-pointer text-[#F30919] text-base"
										onClick={() => window.open("https://xai.games/sentrynodeagreement/")}>
										Sentry Node Agreement
										</a>
									</div>
								</MainCheckbox>


								<MainCheckbox
									onChange={() => setCheckboxTwo(!checkboxTwo)}
									isChecked={checkboxTwo}
									labelStyle="!items-start"
								>
									<div className="sm:w-[300px] md:w-auto">
										<span className="sm:text-base text-elementalGrey">I understand Sentry Node Keys are not transferable</span>
									</div>
								</MainCheckbox>

								<MainCheckbox
									onChange={() => setCheckboxThree(!checkboxThree)}
									isChecked={checkboxThree}
									labelStyle="!items-start"
								>
									<div className="flex w-full sm:w-[300px] justify-between md:w-auto sm:flex-col lg:flex-row items-start">
									<span className="sm:text-base text-elementalGrey lg:mr-2">I understand that I cannot claim rewards until I pass KYC</span>
									<KYCTooltip
										width={850}
									>
										<p className="text-[#F30919] text-base">(See blocked countries)</p>
									</KYCTooltip>
									</div>
								</MainCheckbox>
							</div>

							<div>
								<PrimaryButton
									onClick={() => onClick()}
									className={`w-full h-16 ${checkboxOne && checkboxTwo && checkboxThree && chain?.id === 42_161 ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
									isDisabled={!ready || chain?.id !== 42_161}
									btnText={chain?.id === 42_161 ? "BUY NOW" : "Please Switch to Arbitrum One"}
								/>
									
								{error && (
									<div>
										{error && mapWeb3Error(error) === "Insufficient funds"
											&&
											<div className="flex md:gap-[21px] gap-[10px]">
												<BaseCallout extraClasses={{calloutWrapper: "md:h-[100px] h-[159px] mt-[12px]" , calloutFront: "!justify-start"}} isWarning>
													<div className="flex md:gap-[21px] gap-[10px]">
														<span className="block mt-2"><WarningIcon /></span>
														<div>
															<span className="block font-bold text-lg">
																Insufficient funds to complete transaction
															</span>
															<span className="block font-medium text-lg">
																Make sure your wallet has enough AETH and gas to complete the transaction.
															</span>
														</div>
													</div>
												</BaseCallout>
											</div>
										}
										{error && mapWeb3Error(error) === "User rejected the request" && <BaseCallout extraClasses={{calloutWrapper: "md:h-[85px] h-[109px] mt-[12px]" , calloutFront: "!justify-start"}} isWarning>
											<div className="flex md:gap-[21px] gap-[10px]">
												<span className="block mt-2"><WarningIcon /></span>
												<div>
													<span className="block font-bold text-lg">
														Transaction was cancelled
													</span>
													<span className="block font-medium text-lg">
														You have cancelled the transaction in your wallet.
													</span>
												</div>
											</div>
										</BaseCallout>}
									</div>
								)}
							</div>
						</div>
					</>
				)}
		</div>
	)
}
