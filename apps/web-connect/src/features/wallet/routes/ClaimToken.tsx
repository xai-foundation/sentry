import {useAccount, useNetwork} from "wagmi";
import {XaiBanner} from "@/features/checkout/XaiBanner";
import {useState} from "react";
import {XaiCheckbox} from "@sentry/ui";
import {useNavigate} from "react-router-dom";
import {useBlockIp} from "@/hooks/useBlockIp";
import {BiLoaderAlt} from "react-icons/bi";

export function ClaimToken() {
	const {blocked, loading} = useBlockIp({blockUsa: true});

	const {address} = useAccount();
	const navigate = useNavigate();

	const [eligible,] = useState<boolean>(false);
	const {chain} = useNetwork();

	const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
	const ready = checkboxOne && chain?.id === 42_161

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
			</div>
		)
	}

	if (blocked) {
		return (
			<pre className="p-2 text-[14px]">Not Found</pre>
		)
	}

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col justify-center items-center">
				<XaiBanner/>
				<div
					className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
					<div
						className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
						<p className="text-3xl font-semibold">
							Claim Xai Tokens
						</p>

						{!address && (
							<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
								Connect your wallet to check your eligibility.
							</p>
						)}

						{address ? (
							<>
								{eligible ? (
									<>
										<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
											You are eligible to claim Xai Tokens!
										</p>
										<div className="flex flex-col justify-center gap-8 p-6 mt-8">

											<div className="flex flex-col justify-center gap-2">
												<XaiCheckbox
													onClick={() => setCheckboxOne(!checkboxOne)}
													condition={checkboxOne}
												>
													I agree with the Xai Airdrop
													<a
														className="cursor-pointer text-[#F30919]"
														onClick={() => navigate("/xai-airdrop-terms-and-conditions")}>
														Terms and Conditions
													</a>
												</XaiCheckbox>
											</div>

											<div className="w-full">
												<button
													// onClick={() => write}
													className={`w-[576px] h-16 ${ready ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
													disabled={!ready}
												>
													{chain?.id === 42_161 ? "Claim" : "Please Switch to Arbitrum One"}
												</button>
											</div>
										</div>
									</>
								) : (
									<>
										<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
											This wallet ({address}) is ineligible to claim any Xai Tokens.
										</p>
										<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
											You can connect a different wallet to determine if it is eligible.
										</p>
									</>
								)}
							</>
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
