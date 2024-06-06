import {useAccount, useContractRead, useNetwork} from "wagmi";
import {useListNodeLicenses} from "@/hooks/useListNodeLicenses";
import {BiLoaderAlt} from "react-icons/bi";
import {useEffect, useState} from "react";
import {checkKycStatus, xaiRedEnvelopeAbi} from "@sentry/core";
import {useBlockIp} from "@/hooks/useBlockIp";
import {FaCircleCheck, FaCircleXmark} from "react-icons/fa6";
import {Link} from "react-router-dom";
import { config } from "@sentry/core";

export function RedEnvelope2024() {
	const {blocked, loading: loadingGeo} = useBlockIp({blockUsa: true});

	const {address} = useAccount();
	console.log("address:", address);
	const {chain} = useNetwork();
	console.log("chain:", chain);

	// check license balance
	const {isLoading: licenseBalanceLoading, data} = useListNodeLicenses(address ? [address] : undefined);

	// check license balance
	const [kycStatus, setKycStatus] = useState<{wallet: string, isKycApproved: boolean}>();
	const [showInput, setShowInput] = useState(() => document.cookie.includes('showInput=true'));
	const [_, setInputError] = useState("");
	const [value] = useState("");

	useEffect(() => {
		if (address) {
			void validateKycStatus();
		}
	}, [address]);

	useEffect(() => {
		if (value.length > 0) {
			if (validateTweet(value)) {
				setInputError("");
			} else {
				setInputError("Please enter a URL to a valid tweet.");
			}
		}
	}, [value]);

	async function validateKycStatus(): Promise<void> {
		const res = await checkKycStatus([address!]);
		setKycStatus(res[0]);
	}

	const {data: isTwitterPostSubmittedData} = useContractRead({
		address: config.xaiRedEnvelope2024Address as `0x${string}`,
		abi: xaiRedEnvelopeAbi,
		functionName: "userXPostVerifications",
		args: [address],
		watch: true,
		enabled: !!address,
		onError(error) {
			console.warn("isTwitterPostSubmittedData Error", error);
		},
	});
	console.log("isTwitterPostSubmittedData:", isTwitterPostSubmittedData)

	// const {isLoading: isSubmitClaimRequestLoading, write, error, isSuccess: isSubmitClaimRequestSuccess} = useContractWrite({
	// 	address: config.xaiRedEnvelope2024Address  as `0x${string}`,
	// 	abi: xaiRedEnvelopeAbi,
	// 	functionName: "submitClaimRequest",
	// 	args: [value],
	// 	onError(error) {
	// 		console.warn("Error", error);
	// 	},
	// });

	if (loadingGeo) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
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

	// function attemptSubmit() {
	// 	setInputError("");

	// 	if (validateTweet(value)) {
	// 		write();
	// 	} else {
	// 		setInputError("Please enter a URL to a valid tweet.");
	// 	}
	// }

	function validateTweet(tweet: string): boolean {
		return tweet.indexOf("twitter.com") > -1 || tweet.indexOf("x.com") > -1;
	}

	const keys = data?.totalLicenses || 0;
	const approved = kycStatus?.isKycApproved;
	const userEligible = keys > 0 && approved && showInput;
	const eligibleTokens = 80 + (8 * keys);

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col items-center pt-36">
				<div className="w-[420px] mb-6">
					<img
						src="/images/red-drag.jpeg"
					/>
				</div>
				<h1 className="text-3xl font-semibold text-center">Lunar New Year: Year of the Dragon - Xai Airdrop</h1>

				{!address && !data && (
					<>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-6">
							Welcome to the XAI token claim portal in celebration of Lunar New Year 2024 - Year of the Dragon! If you're a Sentry Key holder who has passed KYC, you’re just one step away from claiming XAI tokens.
						</p>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-6">
							Connect your wallet and complete the Tweet quest below. Share your excitement about Xai on X (formerly Twitter), then come back on Friday, 2/23 at 11:00 PM UTC to claim your XAI tokens.
						</p>
						<div className="m-8">
							<w3m-button/>
						</div>
					</>
				)}

				{address && !data && (
					<p className="text-lg text-[#525252] max-w-[590px] text-center mt-6">
						Loading...
					</p>
				)}

				{address && data && chain?.id !== 42161 && (
				// {address && data && chain.id !== 42170 && (
					<>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-6">
							Please switch to Arbitrum One with the button below
						</p>
						<div className="m-8">
							<w3m-button/>
						</div>
					</>
				)}

				{address && data && chain?.id === 42161 && (
				// {address && data && chain.id === 42170 &&(
					<>
						{licenseBalanceLoading && (
							<div className="w-full h-full flex justify-center items-center mt-8">
								<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
							</div>
						)}

						{data && (
							<div className="mt-4 w-[320px]">
								<p className="text-lg text-[#525252] max-w-[590px] text-center mb-2">
									In order to be eligible, you must...
								</p>
								<div className="flex flex-col gap-2 my-4">
									<div className="flex gap-2">
										<div>
											{keys > 0 ? <FaCircleCheck color={"#16A34A"} size={20}/> : <FaCircleXmark color={"#F30919"} size={20}/>}
										</div>
										<div>
											Own at least 1 Sentry Key
										</div>
									</div>
									<div className="flex gap-2">
										<div>
											{approved ? <FaCircleCheck color={"#16A34A"} size={20}/> : <FaCircleXmark color={"#F30919"} size={20}/>}
										</div>
										<div>
											Passed KYC
										</div>
									</div>
									{/* <div className="flex gap-2">
										<div>
											{(isTwitterPostSubmittedData as string)?.length > 0 || showInput ? <FaCircleCheck color={"#16A34A"} size={20}/> : <FaCircleXmark color={"#F30919"} size={20}/>}
										</div>
										<div>
											Submitted Tweet by Thursday, 2/22 at 10:59 PM UTC.
										</div>
									</div> */}
								</div>

								{keys < 1 ? (
									<p className="text-sm text-[#525252] max-w-[590px] text-center mb-2">
										Currently, you do not own any Xai Sentry Keys. To be eligible to claim XAI tokens, you must click <Link to="/" className="text-[#1DA1F2] brightness-75">here</Link> to complete your order for at least 1 Sentry Key and then pass KYC via the Sentry Node app. Then return to this page and check your eligibility.
									</p>
								) : (
									<>
										<p className="text-lg text-[#525252] max-w-[590px] text-center mb-2">
											{`You are eligible for ${eligibleTokens} Xai!`}
										</p>
										{!approved && (
											<p className="text-md text-[#525252] max-w-[590px] text-center mb-2">
												You have not passed KYC. Download the Sentry Node app <a href="https://xai.games/" target="_blank" className="text-[#1DA1F2] brightness-75">here</a> and follow the steps to KYC. Once you have passed, return to this page to check your eligibility.
											</p>
										)}
										{/*<p className="text-sm text-[#525252] max-w-[590px] text-center mb-2">*/}
										{/*	Return to this page between Friday, 2/23 at 11:00 PM UTC and Monday, 3/25 at 10:59 PM UTC to claim your XAI tokens.*/}
										{/*</p>*/}
									</>
								)}
								{/*<p className="text-md text-[#525252] max-w-[590px] text-center mb-2">*/}
								{/*	Claim available Friday, 2/23 at 11:00 PM UTC to Monday, 3/25 at 10:59 PM UTC.*/}
								{/*</p>*/}

								{!showInput && (
									<>
										<div className="mt-6 mb-6">
											<a
												className="twitter-share-button"
												href="https://twitter.com/intent/tweet?text=Xai is a modular execution layer for game logic built on the Arbitrum Orbit stack to facilitate the onboarding of millions of gamers. And now they’re airdropping $XAI to Sentry Node Key holders to celebrate the Year of the Dragon. 🐉🧧"
												target="_blank"
												rel="noopener noreferrer"
												data-size="large"
											>
												<button
													onClick={() => {
														setShowInput(true);
														document.cookie = "showInput=true; path=/";
													}}
													className="w-full h-16 text-sm text-white p-2 uppercase font-semibold bg-[#F30919]"
												>
													CLICK HERE TO TWEET
												</button>
											</a>
										</div>
									</>
								)}

								{/* {showInput && !isSubmitClaimRequestSuccess && (
									<div>
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
										{inputError.length > 0 && (
											<p className="text-sm text-[#F30919]">
												{inputError}
											</p>
										)}

										<button
											disabled={isSubmitClaimRequestLoading}
											onClick={attemptSubmit}
											className={`w-full h-16 text-sm text-white p-2 uppercase font-semibold bg-[#F30919] mt-4`}
										>
											{isSubmitClaimRequestLoading ? "Submitting..." : "SUBMIT TWEET"}
										</button>

										<p className="text-sm text-[#525252] max-w-[590px] text-center mt-4">
											You can submit only 1 tweet per wallet. Ensure it is a valid tweet about Xai so that you are eligible for the claim.
										</p>

										{error && (
											<p className="text-center break-words w-full mt-4 text-red-500">
												{error.message}
											</p>
										)}
									</div>
								)} */}

								{userEligible && (
									<div>
										{/* <h3 className="text-xl font-semibold text-center">Submission Successful.</h3> */}
										<p className="text-center">
											Congratulations! You've successfully completed all required actions to qualify for claiming XAI tokens for Lunar New Year 2024. Please revisit this page starting from Friday, February 23rd at 11:00 PM UTC until Monday, March 25th at 10:59 PM UTC to claim your {eligibleTokens} Xai.
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
