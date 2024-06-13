import {BiLoaderAlt} from "react-icons/bi";
import {AiOutlineClose} from "react-icons/ai";
import {useGetPriceForQuantity} from "@/features/keys/hooks/useGetPriceForQuantity";
import {useGetTotalSupplyAndCap} from "@/features/keys/hooks/useGetTotalSupplyAndCap";
import {Dispatch, SetStateAction, useState} from "react";
import {ethers} from "ethers";
// import {Tooltip} from "@sentry/ui";
import {getPromoCode} from "@sentry/core";
import { PlusIcon, WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";

interface BuyKeysOrderTotalProps {
	quantity: number;
	promoCode: string;
	setPromoCode: Dispatch<SetStateAction<string>>;
}

export function BuyKeysOrderTotal({quantity, promoCode, setPromoCode}: BuyKeysOrderTotalProps) {
	const {data: getPriceData, isLoading: isPriceLoading} = useGetPriceForQuantity(quantity);
	const {isLoading: isTotalLoading} = useGetTotalSupplyAndCap();
	const [discount, setDiscount] = useState({
		applied: false,
		error: false,
	});
	const [promo, setPromo] = useState<boolean>(false);

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
		if (!getPriceData) {
			return
		}

		return getPriceData.nodesAtEachPrice
			.filter(item => Number(item.quantity) !== 0)
			.map((item, i) => {
				return (
					<div key={`get-keys-${i}`}>
						<div className="flex flex-row items-center justify-between text-[15px]">
							<div className="flex flex-row items-center gap-2">
								<p className="text-white font-medium text-lg">{item.quantity.toString()} x Xai Sentry Node Key</p>
							</div>
							<div className="flex flex-row items-center gap-1">
								<p className="font-bold uppercase text-lg text-white">
									{ethers.formatEther(item.totalPriceForTier)} AETH
								</p>
							</div>
						</div>
						<p className="text-base text-elementalGrey mb-4">
							{ethers.formatEther(item.pricePer)} AETH per key
						</p>
					</div>
				);
			});
	}

	const displayPricesMayVary = (getPriceData?.nodesAtEachPrice?.filter((node) => node.quantity !== 0n) ?? []).length >= 2;


	return (
		<>
			{isPriceLoading || isTotalLoading || !getPriceData
				? (
					<div className="w-full h-full flex flex-col justify-center items-center">
						<BiLoaderAlt className="animate-spin" color={"#FF0030"} size={32}/>
						<p className="text-lg text-white font-semibold">Updating total...</p>
					</div>
				) : (
					<>
						<div className="w-full flex flex-col gap-4">
							{/* <div className="w-full items-center gap-2">
								<div className="w-12 flex flex-row text-sm text-[#A3A3A3] mt-4 px-6">
									<p className="flex items-center gap-1">
										TOTAL
										<Tooltip
											body={"All purchases must be made in Arbitrum ETH"}
											width={337}
											position={"end"}
										>
											<AiOutlineInfoCircle size={16}/>
										</Tooltip>
									</p>
								</div>
							</div> */}

							<div className="px-6">
								{getKeys()}

								{discount.applied && (
									<>
										<div className="flex flex-row items-center justify-between text-[15px]">
											<div className="flex flex-row items-center gap-2">
												<p className="text-lg text-white font-bold">Discount (5%)</p>

												<a
													onClick={() => setDiscount({applied: false, error: false})}
													className="text-[#FF0030] ml-1 cursor-pointer"
												>
													Remove
												</a>

											</div>
											<div className="flex flex-row items-center gap-1">
												<p className="text-white font-bold text-xl">
													{ethers.formatEther(getPriceData.price * BigInt(5) / BigInt(100))} AETH
												</p>
											</div>
										</div>
										<p className="text-[13px] text-[#A3A3A3] ">
											{promoCode}
										</p>
									</>
								)}

								{displayPricesMayVary && (
									<BaseCallout extraClasses={{ calloutWrapper: "", calloutFront: "flex-col !items-start text-bananaBoat !text-lg" }} isWarning>
										<div className="flex items-center gap-2 font-semibold">
											<WarningIcon width={16} height={16}/>
											<p className="text-lg">
												Your transaction may be reverted
											</p>
										</div>
										<p className="text-base">
											Xai Sentry Node Key prices vary depending on the quantity of remaining
											supply. In general, as the quantity of available keys decreases, the price
											of a key will increase. If you purchase more Keys than are available in the
											current pricing tier, the transaction may revert. We recommend splitting the
											purchase into two transactions - one for the current pricing tier and
											another in the next pricing tier.
										</p>
									</BaseCallout>
								)}

								{/*		Promo section		*/}
								{!discount.applied && (
									<>
										<hr className="my-2 border-t-chromaphobicBlack"/>
										{promo ? (
											<div>
												<div
													className="w-full h-auto flex flex-row justify-between items-center text-[15px] text-[#525252] mt-2 py-2">
													<p className="text-lg text-americanSilver">Add promo code</p>
													<div
														className="cursor-pointer z-10"
														onClick={() => {
															setPromoCode("");
															setPromo(false);
														}}
													>
														<AiOutlineClose size={20} color={"#D0CFCF"}/>
													</div>
												</div>

												<div className="flex gap-2 items-center">

													<div className={`w-full bg-foggyLondon global-clip-primary-btn p-[1px] focus-within:bg-hornetSting`}>
													<input
														type="text"
														value={promoCode}
														onChange={(e) => {
															setPromoCode(e.target.value)
															setDiscount({applied: false, error: false})
														}}
														className={`w-full p-2 global-clip-primary-btn focus:outline-0 placeholder:text-americanSilver placeholder:text-lg bg-nulnOil text-americanSilver text-lg`}
														placeholder="Enter promo code"
													/>
													</div>
													<div>
													<PrimaryButton
														onClick={() => handleSubmit()}
														className="w-[92px] h-[44px] !p-1 text-lg font-semibold uppercase"
														btnText="Apply"
														/>
													</div>
												</div>

												{discount.error && (
													<BaseCallout isWarning extraClasses={{calloutWrapper: "w-full text-bananaBoat mt-2"}}> <WarningIcon width={20} height={20}/> <span className="ml-2">Error with Promo Code</span></BaseCallout>
												)}
											</div>
										) : (
											<p className="text-[15px] py-2">
												<a
													onClick={() => setPromo(true)}
													className="flex items-center text-[#FF2C3A] text-lg font-bold ml-1 cursor-pointer"
												>
													<PlusIcon width={14} height={14}/> <span className="ml-1">Add promo code</span>
												</a>
											</p>
										)}
									</>
								)}

								<hr className="my-2 border-t-chromaphobicBlack"/>
								<div className="flex flex-row items-center justify-between">
									<div className="flex flex-row items-center gap-2 text-2xl font-bold text-white">
										<p className="">You pay</p>
									</div>
									<div className="flex flex-row items-center gap-1 font-bold text-white text-3xl">
										<p>
											{discount.applied
												? ethers.formatEther(getPriceData.price * BigInt(95) / BigInt(100))
												: ethers.formatEther(getPriceData.price)
											}
										</p>
										<p>AETH</p>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
		</>
	)
}
