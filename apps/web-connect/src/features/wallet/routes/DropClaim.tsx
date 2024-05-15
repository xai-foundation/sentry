import {useAccount, useContractWrite, useNetwork} from "wagmi";
import {ConnectButton, PrimaryButton, XaiCheckbox} from "@sentry/ui";
import {KYCTooltip} from "@/features/checkout/KYCTooltip";
import {useState} from "react";
import {useListClaimableAmount} from "@/features/checkout/hooks/useListClaimableAmount";
import {BiLoaderAlt} from "react-icons/bi";
import {config, NodeLicenseAbi} from "@sentry/core";
import {FaCircleCheck} from "react-icons/fa6";
import {useBlockIp} from "@/hooks/useBlockIp";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { WarningNotification } from "@sentry/ui/src/rebrand/notifications";

export function DropClaim() {
	const {blocked, loading} = useBlockIp({blockUsa: true});

	const {address} = useAccount();
	const {open} = useWeb3Modal()
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
				<BiLoaderAlt className="animate-spin" size={32} color={"#F30919"}/>
			</div>
		);
	}

	if (blocked) {
		return (
			<div className='w-full h-screen flex justify-center items-center'>
				<p className="p-2 text-md text-white">You are in a country restricted from using this application.</p>
			</div>
		);
	}

	return (
		<div>
			<div className="h-full min-h-screen flex-1 flex flex-col justify-center items-center">
				{isSuccess ? (
					<div
						className="flex flex-col justify-center items-center lg:w-[744px] bg-darkLicorice shadow-main lg:p-12 sm:p-4">
						<div className="w-full flex justify-center">
							<FaCircleCheck color={"#16A34A"} size={64}/>
						</div>

						<p className="text-3xl font-bold mt-4 uppercase text-white sm:text-center">
							Sentry Keys Redeemed
						</p>

						<PrimaryButton onClick={() => window.location.reload()} btnText={"Redeem More Keys"} colorStyle="primary" className="mt-8 w-full uppercase font-bold text-xl text-white"  isDisabled={false} />
					</div>
				) : (
					<div
						className="flex flex-col justify-center items-center md:w-[500px] lg:w-[744px] bg-darkLicorice shadow-main m-4 lg:p-12 sm:p-8">
						<div
							className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
							<p className="text-3xl font-bold text-white">
								REDEEM SENTRY KEYS
							</p>

							{isClaimableAmountLoading ? (
								<div className="w-full h-[150px] flex flex-col justify-center items-center gap-2 text-elementalGrey">
									<BiLoaderAlt className="animate-spin" color={"#F30919"} size={32}/>
									<p>Redemption in progress...</p>
								</div>
							) : (
								<>
									{!address && (
										<p className="text-lg text-medium text-elementalGrey max-w-[590px] text-center mt-2">
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
															<div className="text-center sm:w-[400px] md:w-[600px] h-[200px] p-4 overflow-y-auto break-words mt-4 text-[#F30919]">
																{error.message}
															</div>
														)}
													</div>
												</>
											) : (
												<>
													<WarningNotification title="Wallet is ineligible" showIcon text={`This wallet (${address}) is not eligible to claim any Xai Sentry Keys. You can connect a different wallet to determine if it is
														eligible.`} />
												</>
											)}
										</>
									) : (
										<div className="m-8 w-full">
											<ConnectButton onOpen={open} address={address} isFullWidth/>
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
