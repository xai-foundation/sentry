import {BiLoaderAlt} from "react-icons/bi";
import {AiFillInfoCircle, AiOutlineClose} from "react-icons/ai";
import {useGetTotalSupplyAndCap} from "@/features/checkout/hooks/useGetTotalSupplyAndCap";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {ethers} from "ethers";
import {CheckoutTierSummary} from "@sentry/core";
import {XaiCheckbox} from "@sentry/ui";

interface PriceDataInterface {
	price: bigint;
	nodesAtEachPrice: Array<CheckoutTierSummary>;
}

interface WebBuyKeysOrderTotalProps {
	onClick: () => void;
	getPriceData: PriceDataInterface | undefined;
	isPriceLoading: boolean;
	promoCode: string;
	setPromoCode: Dispatch<SetStateAction<string>>;
	error: Error | null;
}

export function WebBuyKeysOrderTotal(
	{
		onClick,
		getPriceData,
		isPriceLoading,
		promoCode,
		setPromoCode,
		error
	}: WebBuyKeysOrderTotalProps) {
	const {isLoading: isTotalLoading} = useGetTotalSupplyAndCap();
	const [discount, setDiscount] = useState({
		applied: false,
		error: false,
	});

	const [promo, setPromo] = useState<boolean>(false);
	const [price, setPrice] = useState<{ price: number, discount: number }>({price: 0, discount: 0});
	const [terms, setTerms] = useState<boolean>(false);
	const [investments, setInvestments] = useState<boolean>(false);
	const ready = terms && investments;

	useEffect(() => {
		if (getPriceData) {
			setPrice({
				price: Number(ethers.formatEther(getPriceData.price)),
				discount: ((5 / 100) * Number(ethers.formatEther(getPriceData.price))) * -1
			});
		}
	}, [getPriceData]);

	const handleSubmit = () => {
		if (promoCode === "IDONTWANNAPAYFULLPRICE") {
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
								<span className="">{Number(item.quantity)} x Xai Sentry Node Key</span>
							</div>
							<div className="flex flex-row items-center gap-1">
								<span
									className="font-semibold">{Number(ethers.formatEther(item.totalPriceForTier))} ETH</span>
							</div>
						</div>
						<p className="text-[13px] text-[#A3A3A3] mb-4">
							{Number(ethers.formatEther(item.pricePer))} ETH per key
						</p>
					</div>
				);
			});
	}

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
													{price.discount} ETH
												</span>
											</div>
										</div>
										<p className="text-[13px] text-[#A3A3A3] mb-4">
											IDONTWANNAPAYFULLPRICE
										</p>
									</>
								)}

								{getPriceData && getPriceData.nodesAtEachPrice.length > 1 && (
									<div className="w-full flex flex-col bg-[#F5F5F5] px-5 py-4 gap-2 mb-4">
										<div className="flex items-center gap-2 font-semibold">
											<AiFillInfoCircle className="w-[20px] h-[20px] text-[#3B82F6]"/>
											<p className="text-[15px]">
												Prices may vary
											</p>
										</div>
										<p className="text-sm">
											Xai Sentry Node Key prices vary depending on the quantity of
											remaining
											supply.
											In general, as the quantity of available keys decreases, the price
											of a key
											will
											increase.
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
														onClick={() => setPromo(false)}
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
												? Number(price.price + price.discount)
												: Number(price.price)}
										</span>
										<span>ETH</span>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col justify-center gap-8 p-6 mt-8">
							<div className="flex flex-col justify-center gap-2">
								<XaiCheckbox
									onClick={() => setTerms(!terms)}
									condition={terms}
								>
									I agree to the
									<a
										className="cursor-pointer text-[#F30919]"
										onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
										Terms of Service
									</a>
									and the
									<a
										className="cursor-pointer text-[#F30919]"
										onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
										Privacy Policy
									</a>
								</XaiCheckbox>


								<XaiCheckbox
									onClick={() => setInvestments(!investments)}
									condition={investments}
								>
									I understand that Xai Vanguard Nodes are
									<a
										className="cursor-pointer text-[#F30919]"
										onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
										not investments
									</a>
								</XaiCheckbox>
							</div>

							<div>
								<button
									onClick={() => onClick()}
									className={`w-full h-16 ${investments && terms ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
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
