import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {XaiNumberInput} from "@xai-vanguard-node/ui";
import {ethers} from "ethers";
import {useGetTotalSupplyAndCap} from "./hooks/useGetTotalSupplyAndCap.ts";
import {useGetPriceForQuantity} from "./hooks/useGetPriceForQuantity.ts";
import {BiLoaderAlt} from "react-icons/bi";
import {AiFillInfoCircle, AiOutlineClose} from "react-icons/ai";
import {XaiCheckbox} from "@xai-vanguard-node/ui/dist/features/checkbox/XaiCheckbox";

interface WebBuyFlowProps {
	setPurchase: Dispatch<SetStateAction<boolean>>;
}

export function WebBuyFlow({setPurchase}: WebBuyFlowProps) {
	const queryString = window.location.search;
	const queryParams = new URLSearchParams(queryString);
	let prefilledAmount = queryParams.get("amount");
	const [amount, setAmount] = useState<number>(1);

	if (prefilledAmount) {
		setAmount(Number(prefilledAmount));
	}

	const [discountApplied, setDiscountApplied] = useState<boolean>(false);
	const [discountError, setDiscountError] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState('');
	const [promo, setPromo] = useState<boolean>(false);

	const [terms, setTerms] = useState<boolean>(false);
	const [investments, setInvestments] = useState<boolean>(false);
	const [ready, setReady] = useState<boolean>(false);

	const {data: getPriceData, isLoading} = useGetPriceForQuantity(amount);
	const {data: getTotalData, isLoading: isTotalLoading} = useGetTotalSupplyAndCap()

	// Setting default values so TS doesn't give me shit.
	let price = 0;
	let discountPrice = 0;
	let maxSupply = 0;

	// Overriding default values with real data
	if (getPriceData) {
		price = Number(ethers.formatEther(getPriceData.price));
		discountPrice = ((5 / 100) * price) * -1;
	}

	if (getTotalData) {
		maxSupply = Number(getTotalData.maxSupply) - Number(getTotalData.totalSupply);
	}

	useEffect(() => {
		if (terms && investments) {
			setReady(true)
		} else {
			setReady(false);
		}
	}, [terms, investments])

	function getKeys() {
		if (!getPriceData) {
			return
		}

		return getPriceData.nodesAtEachPrice.map((item: any, i: number) => {
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
			)
		})
	}

	function handleSubmit() {
		setDiscountError(false);
		if (inputValue === "IDONTWANNAPAYFULLPRICE") {
			setDiscountApplied(true);
		} else {
			setDiscountError(true);
			setInputValue("");
		}
	}

	return (
		<div>
			<div className="w-[744px] h-auto flex flex-col justify-center border border-[#E5E5E5] m-4">
				<div className="w-full flex justify-center items-center border-b border-[#E5E5E5] px-6 py-4">
					<span className="text-3xl py-2 px-6 font-semibold">Your purchase is ready</span>
				</div>
				<div className="w-full flex justify-between items-center border-b border-[#E5E5E5] px-6 py-4">
					<div className="flex flex-col gap-2">
						<div className="flex flex-row items-center gap-2">
							<p className="flex gap-3 items-center text-lg font-semibold">
								{/*<XaiLogo className="w-[16px]"/>*/}
								Xai Sentry Node Key
							</p>
						</div>
						<p className="w-[294px] text-[15px] text-[#525252]">
							Key for submitting one claim to each Xai network challenge
						</p>
					</div>


					{/*		Quantity section		*/}
					<div className="flex items-center gap-4 px-6">
							<span className="text-sm uppercase text-[#A3A3A3]">
								Quantity
							</span>

						<div className="w-[200px]">
							<XaiNumberInput
								amount={amount}
								setAmount={setAmount}
								maxSupply={maxSupply}
							/>
						</div>
					</div>
				</div>


				<div>
					{isLoading || isTotalLoading
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

										{discountApplied && (
											<>
												<div className="flex flex-row items-center justify-between text-[15px]">
													<div className="flex flex-row items-center gap-2">
														<span>Discount (5%)</span>

														<a
															onClick={() => setDiscountApplied(false)}
															className="text-[#F30919] ml-1 cursor-pointer"
														>
															Remove
														</a>

													</div>
													<div className="flex flex-row items-center gap-1">
												<span className="text-[#2A803D] font-semibold">
													{discountPrice} ETH
												</span>
													</div>
												</div>
												<p className="text-[13px] text-[#A3A3A3] mb-4">
													IDONTWANNAPAYFULLPRICE
												</p>
											</>
										)}

										{getPriceData!.nodesAtEachPrice.length > 1 && (
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
										{!discountApplied && (
											<>
												<hr className="my-2"/>
												{promo ? (
													<div>
														<div
															className="w-full h-auto flex flex-row justify-between items-center text-[15px] text-[#525252] mt-2 py-2">
															<span>Add promo code</span>
															<div className="cursor-pointer z-10"
																 onClick={() => setPromo(false)}>
																<AiOutlineClose/>
															</div>
														</div>

														<div className="flex gap-2 items-center">

															<input
																type="text"
																value={inputValue}
																onChange={(e) => {
																	setInputValue(e.target.value)
																	setDiscountError(false);
																}}
																className={`w-full my-2 p-2 border ${discountError ? "border-[#AB0914]" : "border-[#A3A3A3]"}`}
																placeholder="Enter promo code"
															/>

															<button
																onClick={() => handleSubmit()}
																className="flex flex-row justify-center items-center w-[92px] p-2 bg-[#F30919] text-[15px] text-white font-semibold"
															>
																Apply
															</button>
														</div>

														{discountError && (
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
											{discountApplied
												? Number(price - discountPrice)
												: price}
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
											onClick={() => setPurchase(true)}
											className={`w-full h-16 ${investments && terms ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
											disabled={!ready}
										>
											Confirm purchase
										</button>
									</div>
								</div>
							</>
						)}
				</div>
			</div>
		</div>
	);
}
