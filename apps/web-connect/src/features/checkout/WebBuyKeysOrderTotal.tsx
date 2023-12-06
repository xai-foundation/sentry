import {BiLoaderAlt} from "react-icons/bi";
import {AiFillInfoCircle, AiOutlineClose} from "react-icons/ai";
import {useGetTotalSupplyAndCap} from "@/features/checkout/hooks/useGetTotalSupplyAndCap";
import {Dispatch, SetStateAction, useState} from "react";
import {ethers} from "ethers";
import {CheckoutTierSummary, getPromoCode} from "@sentry/core";
import {XaiCheckbox} from "@sentry/ui";
import {KYCTooltip} from "@/features/checkout/KYCTooltip";

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
						<div className="flex flex-row items-center justify-between text-[15px]">
							<div className="flex flex-row items-center gap-2">
								<span className="">{item.quantity.toString()} x Xai Sentry Node Key</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<span
									className="font-semibold">
									{ethers.formatEther(item.totalPriceForTier)} ETH
								</span>
							</div>
						</div>
						<p className="text-[13px] text-[#A3A3A3] mb-4">
							{ethers.formatEther(item.pricePer)} ETH per key
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
					<div className="w-full h-[390px] flex flex-col justify-center items-center gap-2">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<p>Updating total...</p>
					</div>
				) : (
					<>
						<div className="w-full flex flex-col gap-4">
							<div className="px-6 mt-4">
								{getKeys()}

								{discount.applied && (
									<>
										<div className="flex flex-row items-center justify-between text-[15px]">
											<div className="flex flex-row items-center gap-2">
												<span>Discount (5%)</span>

												<a
													onClick={() => setDiscount({applied: false, error: false})}
													className="text-[#F30919] ml-1 cursor-pointer"
												>
													Remove
												</a>

											</div>
											<div className="flex flex-row items-center gap-1">
												<span className="text-[#2A803D] font-semibold">
													{ethers.formatEther(getPriceData.price * BigInt(5) / BigInt(100))} ETH
												</span>
											</div>
										</div>
										<p className="text-[13px] text-[#A3A3A3] ">
											{promoCode}
										</p>
									</>
								)}

								{displayPricesMayVary && (
									<div className="w-full flex flex-col bg-[#F5F5F5] px-5 py-4 gap-2 mb-4">
										<div className="flex items-center gap-2 font-semibold">
											<AiFillInfoCircle className="w-[20px] h-[20px] text-[#3B82F6]"/>
											<p className="text-[15px]">
												Your transaction may be reverted
											</p>
										</div>
										<p className="text-sm">
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
										<hr className="my-2"/>
										{promo ? (
											<div>
												<div
													className="w-full h-auto flex flex-row justify-between items-center text-[15px] text-[#525252] mt-2 py-2">
													<span>Add promo code</span>
													<div
														className="cursor-pointer z-10"
														onClick={() => {
															setPromoCode("");
															setPromo(false);
														}}
													>
														<AiOutlineClose/>
													</div>
												</div>

												<div className="flex gap-2 items-center">

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
														className={`w-full my-2 p-2 border ${discount.error ? "border-[#AB0914]" : "border-[#A3A3A3]"}`}
														placeholder="Enter promo code"
													/>

													<button
														onClick={() => handleSubmit()}
														className="flex flex-row justify-center items-center w-[92px] p-2 bg-[#F30919] text-[15px] text-white font-semibold"
													>
														Apply
													</button>
												</div>

												{discount.error && (
													<p className="text-[14px] text-[#AB0914]">Invalid referral
														address</p>
												)}
											</div>
										) : (
											<p className="text-[15px] py-2">
												<a
													onClick={() => setPromo(true)}
													className="text-[#F30919] ml-1 cursor-pointer"
												>
													+ Add promo code
												</a>
											</p>
										)}
									</>
								)}

								<hr className="my-2"/>
								<div className="flex flex-row items-center justify-between">
									<div className="flex flex-row items-center gap-2 text-lg">
										<span className="">You pay</span>
									</div>
									<div className="flex flex-row items-center gap-1 font-semibold">
										<span>
											{discount.applied
												? ethers.formatEther(getPriceData.price * BigInt(95) / BigInt(100))
												: ethers.formatEther(getPriceData.price)
											}
										</span>
										<span>ETH</span>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col justify-center gap-8 p-6 mt-8">
							<div className="flex flex-col justify-center gap-2">
								<XaiCheckbox
									onClick={() => setCheckboxOne(!checkboxOne)}
									condition={checkboxOne}
								>
									I agree with the
									<a
										className="cursor-pointer text-[#F30919]"
										onClick={() => window.open("https://xai.games/sentrynodeagreement/")}>
										Sentry Node Agreement
									</a>
								</XaiCheckbox>


								<XaiCheckbox
									onClick={() => setCheckboxTwo(!checkboxTwo)}
									condition={checkboxTwo}
								>
									I understand Sentry Node Keys are not transferable
								</XaiCheckbox>

								<XaiCheckbox
									onClick={() => setCheckboxThree(!checkboxThree)}
									condition={checkboxThree}
								>
									I understand that I cannot claim rewards until I pass KYC
									<KYCTooltip
										width={850}
									>
										<p className="text-[#F30919]">(SEE BLOCKED COUNTRIES)</p>
									</KYCTooltip>
								</XaiCheckbox>
							</div>

							<div>
								<button
									onClick={() => onClick()}
									className={`w-full h-16 ${checkboxOne && checkboxTwo && checkboxThree ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
									disabled={!ready}
								>
									Confirm purchase
								</button>

								{error && (
									<p className="text-center break-words w-full mt-4 text-red-500">
										{error.message}
									</p>
								)}
							</div>
						</div>
					</>
				)}
		</div>
	)
}
