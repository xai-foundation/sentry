import {useAccount, useContractWrite, useNetwork} from "wagmi";
import {XaiBanner} from "@/features/checkout/XaiBanner";
import {XaiCheckbox} from "@sentry/ui";
import {KYCTooltip} from "@/features/checkout/KYCTooltip";
import {useState} from "react";
import {useListClaimableAmount} from "@/features/checkout/hooks/useListClaimableAmount";
import {BiLoaderAlt} from "react-icons/bi";
import {config, NodeLicenseAbi} from "@sentry/core";
import {FaCircleCheck} from "react-icons/fa6";
import {useBlockIp} from "@/hooks/useBlockIp";

export function DropClaim() {
	const {blocked, loading} = useBlockIp({blockUsa: true});

	const {address} = useAccount();
	const {chain} = useNetwork();
	const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
	const [checkboxTwo, setCheckboxTwo] = useState<boolean>(false);
	const [checkboxThree, setCheckboxThree] = useState<boolean>(false);
	const ready = checkboxOne && checkboxTwo && checkboxThree && chain?.id === 42_161;

	const {data: listClaimableAmountData, isLoading: isClaimableAmountLoading} = useListClaimableAmount(address);

	const {isLoading: isRedeemFromWhitelistLoading, write, error, isSuccess} = useContractWrite({
		address: config.nodeLicenseAddress as `0x${string}`,
		abi: NodeLicenseAbi,
		functionName: "redeemFromWhitelist",
		onError(error) {
			console.warn("Error", error);
		},
	});

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
			</div>
		);
	}

	if (blocked) {
		return (
			<pre className="p-2 text-[14px]">Not Found</pre>
		);
	}

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col justify-center items-center">
				<XaiBanner/>
				{isSuccess ? (
					<div
						className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
						<div className="w-full flex justify-center">
							<FaCircleCheck color={"#16A34A"} size={32}/>
						</div>

						<p className="text-3xl font-semibold mt-4">
							Sentry Keys Redeemed
						</p>

						<button
							onClick={() => window.location.reload()}
							disabled={false}
							className="w-[436px] max-w-full bg-[#F30919] text-white p-4 font-semibold m-8 disabled:bg-slate-400"
						>
							Redeem More Keys
						</button>
					</div>
				) : (
					<div
						className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
						<div
							className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
							<p className="text-3xl font-semibold">
								Redeem Sentry Keys
							</p>

							{isClaimableAmountLoading ? (
								<div className="w-full h-[390px] flex flex-col justify-center items-center gap-2">
									<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
									<p>Loading...</p>
								</div>
							) : (
								<>
									{!address && (
										<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
											Connect your wallet to check your eligibility.
										</p>
									)}

									{address ? (
										<>
											{listClaimableAmountData && Number(listClaimableAmountData?.claimableAmount) !== 0 ? (
												<>
													<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
														This wallet ({address}) is eligible to claim <span
														className="font-semibold">{BigInt(listClaimableAmountData.claimableAmount).toString()}</span> {Number(listClaimableAmountData.claimableAmount) === 1 ? "Key" : "Keys"}.
													</p>
													<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
														You will be able to claim up to 50 Keys per transaction until
														all your eligible Keys are claimed.
													</p>
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
																I understand that I cannot claim rewards until I pass
																KYC
																<KYCTooltip
																	width={850}
																>
																	<p className="text-[#F30919]">(SEE BLOCKED
																		COUNTRIES)</p>
																</KYCTooltip>
															</XaiCheckbox>
														</div>

														<div>
															<button
																onClick={() => write()}
																className={`w-[576px] h-16 ${ready ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
																disabled={!ready || isRedeemFromWhitelistLoading}
															>
																{chain?.id === 42_161 ? "Claim" : "Please Switch to Arbitrum One"}
															</button>
														</div>

														{error && (
															<p className="text-center break-words w-full mt-4 text-red-500">
																{error.message}
															</p>
														)}
													</div>
												</>
											) : (
												<>
													<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
														This wallet ({address}) is ineligible to claim any Xai Sentry
														Keys.
													</p>
													<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
														You can connect a different wallet to determine if it is
														eligible.
													</p>
												</>
											)}
										</>
									) : (
										<div className="m-8">
											<w3m-button/>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
