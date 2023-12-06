import {BiLoaderAlt} from "react-icons/bi";
import {AiFillInfoCircle, AiOutlineClose, AiOutlineInfoCircle} from "react-icons/ai";
import {useGetPriceForQuantity} from "@/features/keys/hooks/useGetPriceForQuantity";
import {useGetTotalSupplyAndCap} from "@/features/keys/hooks/useGetTotalSupplyAndCap";
import {Dispatch, SetStateAction, useState} from "react";
import {ethers} from "ethers";
import {Tooltip} from "@sentry/ui";
import {getPromoCode} from "@sentry/core";

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
								<p className="">{item.quantity.toString()} x Xai Sentry Node Key</p>
							</div>
							<div className="flex flex-row items-center gap-1">
								<p className="font-semibold">
									{ethers.formatEther(item.totalPriceForTier)} ETH
								</p>
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
		<>
			{isPriceLoading || isTotalLoading || !getPriceData
				? (
					<div className="w-full h-full flex flex-col justify-center items-center">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<p>Updating total...</p>
					</div>
				) : (
					<>
						<div className="w-full flex flex-col gap-4">
							<div className="w-full items-center gap-2">
								<div className="w-full">
									<hr/>
								</div>
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
							</div>

							<div className="px-6">
								{getKeys()}

								{discount.applied && (
									<>
										<div className="flex flex-row items-center justify-between text-[15px]">
											<div className="flex flex-row items-center gap-2">
												<p>Discount (5%)</p>

												<a
													onClick={() => setDiscount({applied: false, error: false})}
													className="text-[#F30919] ml-1 cursor-pointer"
												>
													Remove
												</a>

											</div>
											<div className="flex flex-row items-center gap-1">
												<p className="text-[#2A803D] font-semibold">
													{ethers.formatEther(getPriceData.price * BigInt(5) / BigInt(100))} ETH
												</p>
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
													<p>Add promo code</p>
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
															setDiscount({applied: false, error: false})
														}}
														className={`w-full my-2 p-2 border ${discount.error ? "border-[#AB0914]" : "border-[#A3A3A3]"}`}
														placeholder="Enter promo code"
													/>

													<button
														onClick={() => handleSubmit()}
														className="flex flex-row justify-center items-center w-[92px] p-2 bg-[#F30919] text-[15px] text-white font-semibold uppercase"
													>
														Apply
													</button>
												</div>

												{discount.error && (
													<p className="text-[14px] text-[#AB0914]">Error with Promo Code</p>
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
										<p className="">You pay</p>
									</div>
									<div className="flex flex-row items-center gap-1 font-semibold">
										<p>
											{discount.applied
												? ethers.formatEther(getPriceData.price * BigInt(95) / BigInt(100))
												: ethers.formatEther(getPriceData.price)
											}
										</p>
										<p>ETH</p>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
		</>
	)
}
