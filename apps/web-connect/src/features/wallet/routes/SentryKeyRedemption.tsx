import {useParams} from "react-router-dom";
import {useAccount, useContractWrite, useNetwork} from "wagmi";
import {config, NodeLicenseAbi} from "@sentry/core";
import {XaiBanner} from "@/features/checkout/XaiBanner";
import {XaiCheckbox} from "@sentry/ui";
import {KYCTooltip} from "@/features/checkout/KYCTooltip";
import {useState} from "react";

export function SentryKeyRedemption() {
	// const navigate = useNavigate();
	const params = useParams<{ operatorAddress: string }>();
	const {address} = useAccount();
	const {chain} = useNetwork();
	const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
	const [checkboxTwo, setCheckboxTwo] = useState<boolean>(false);
	const [checkboxThree, setCheckboxThree] = useState<boolean>(false);
	const ready = checkboxOne && checkboxTwo && checkboxThree;

	// const {isLoading, isSuccess, write, error, data} = useContractWrite({
	const {write, error} = useContractWrite({
		address: config.nodeLicenseAddress as `0x${string}`,
		abi: NodeLicenseAbi,
		functionName: "whitelistAmounts",
		args: [params.operatorAddress, true],
		onSuccess(data) {
			window.location = `xai-sentry://assigned-wallet?txHash=${data.hash}` as unknown as Location;
		},
		onError(error) {
			console.warn("Error", error);
		},
	});

	// function returnToClient() {
	// 	window.location = `xai-sentry://assigned-wallet?txHash=${data?.hash}` as unknown as Location;
	// }

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col justify-center items-center">
				<XaiBanner/>
				<div
					className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
					<div
						className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
						<p className="text-3xl font-semibold">
							Redeem Sentry Keys
						</p>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
							Buyer Beware.
						</p>
						{error && (
							<p className="text-center break-words w-full mt-4 text-red-500">
								{error.message}
							</p>
						)}
						{address ? (
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
										onClick={() => write}
										className={`w-full h-16 ${checkboxOne && checkboxTwo && checkboxThree && chain?.id === 42_161 ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
										disabled={!ready || chain?.id !== 42_161}
									>
										{chain?.id === 42_161 ? "Claim" : "Please Switch to Arbitrum One"}
									</button>

									{error && (
										<p className="text-center break-words w-full mt-4 text-red-500">
											{error.message}
										</p>
									)}
								</div>
							</div>
						) : (
							<div className="m-8">
								<w3m-button/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
