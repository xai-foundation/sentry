import {useAccount, useContractWrite} from "wagmi";
import {useListNodeLicenses} from "@/hooks/useListNodeLicenses";
import {BiLoaderAlt} from "react-icons/bi";
import {useState} from "react";
import {xaiRedEnvelopeAbi} from "@sentry/core";
import {success} from "concurrently/dist/src/defaults";

export function RedEnvelope2024() {
	const {address} = useAccount();
	const {isLoading: licenseBalanceLoading, data} = useListNodeLicenses(address ? [address] : undefined);
	console.log("data:", data?.totalLicenses);
	const [showInput, setShowInput] = useState(false);
	const [value, setValue] = useState("");


	const {isLoading: isSubmitClaimRequestLoading, write, error, isSuccess} = useContractWrite({
		address: "0x09E777Cd84884e1A2dD626977dCec52A4074D3aa" as `0x${string}`,
		abi: xaiRedEnvelopeAbi,
		functionName: "submitClaimRequest",
		args: [value],
		onError(error) {
			console.warn("Error", error);
		},
	});

	console.log(isSubmitClaimRequestLoading, write, error, isSuccess);

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col items-center pt-40">
				<h1 className="text-3xl font-semibold text-center">XAI Red Envelope 2024</h1>

				{!address && !data && (
					<>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
							Connect your wallet to check your eligibility.
						</p>
						<div className="m-8">
							<w3m-button/>
						</div>
					</>
				)}

				{address && !data && (
					<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
						Loading...
					</p>
				)}

				{address && data && (
					<>
						{licenseBalanceLoading && (
							<div className="w-full h-full flex justify-center items-center mt-8">
								<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
							</div>
						)}

						{data && (
							<div className="mt-4 w-[320px]">
								{!showInput && (
									<div>
										<a
											className="twitter-share-button"
											href="https://twitter.com/intent/tweet?text=Hello%20world"
											target="_blank"
											rel="noopener noreferrer"
											data-size="large"
										>
											<button
												onClick={() => setShowInput(true)}
												className={`w-full h-16 text-sm text-white p-2 uppercase font-semibold bg-[#1DA1F2]`}
											>
												CLICK HERE TO TWEET
											</button>
										</a>
									</div>
								)}

								{showInput && !isSuccess && (
									<div>
										<p className="text-lg text-[#525252] max-w-[590px] text-center">
											{data.totalLicenses >0 ? `You are eligible for ${80 + (8 * data.totalLicenses)} Xai!` : "You must own at least 1 node license to be eligible for this drop."}
										</p>

										<label className="font-bold block mt-4">
											Enter the URL of your tweet
										</label>
										<input
											type="text"
											value={value}
											disabled={isSubmitClaimRequestLoading}
											className="w-full h-12 border border-[#A3A3A3] hover:cursor-text hover:bg-white hover:border-gray-300 hover:outline-none px-4"
											placeholder="Your tweet URL..."
											onChange={(e) => setValue(e.target.value)}
										/>

										<button
											disabled={isSubmitClaimRequestLoading}
											onClick={write}
											className={`w-full h-16 text-sm text-white p-2 uppercase font-semibold bg-[#F30919] mt-4`}
										>
											SUBMIT CLAIM REQUEST
										</button>

										{isSubmitClaimRequestLoading && (
											<div className="mt-6">
												Submitting...
											</div>
										)}

										{error && (
											<p className="text-center break-words w-full mt-4 text-red-500">
												{error.message}
											</p>
										)}
									</div>
								)}

								{isSuccess && (
									<div>
										<h3 className="text-xl font-semibold text-center">Submission Successful.</h3>
										<p className="text-center">
											Please return after 2 weeks to claim your rewards.
										</p>
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
