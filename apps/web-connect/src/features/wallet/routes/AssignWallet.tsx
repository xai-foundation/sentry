import {MdVerifiedUser} from "react-icons/md";
import {useNavigate, useParams} from "react-router-dom";
import {useAccount, useContractWrite} from "wagmi";
import {config, RefereeAbi} from "@xai-vanguard-node/core";
import {FaCircleCheck} from "react-icons/fa6";

export function AssignWallet() {
	const navigate = useNavigate();
	const params = useParams<{operatorAddress: string}>();
	const {address} = useAccount();

	const {isLoading, isSuccess, write, error, data} = useContractWrite({
		address: config.refereeAddress as `0x${string}`,
		abi: RefereeAbi,
		functionName: "setApprovalForOperator",
		args: [params.operatorAddress, true],
		onSuccess(data) {
			// navigate("xai-sentry://test");
			// window.open("xai-sentry://test");
			window.location = `xai-sentry://assigned-wallet?txHash=${data.hash}` as unknown as Location;
		},
		onError(error) {
			console.log("Error", error);
		},
	});

	function getShortenedWallet(address: string) {
		const firstFiveChars = address.slice(0, 5);
		const lastThreeChars = address.slice(-5);
		return `${firstFiveChars}...${lastThreeChars}`;
	}

	function returnToClient() {
		window.location = `xai-sentry://assigned-wallet?txHash=${data?.hash}` as unknown as Location;
	}

	return (
		<div>
			<div className="h-screen flex flex-col justify-center items-center">
				<div className="w-[744px] flex flex-col gap-2 bg-[#DCFCE6] p-6">
					<span className="flex flex-row gap-1 items-center font-semibold">
						<MdVerifiedUser size={22} color={"#38A349"}/>You are on the official <p
						className="text-[#2A803D]">Xai.games</p> website
					</span>
					<p className="text-[15px] text-[#15803D]">
						Purchases from Xai will only ever occur on Xai.games. Check that you are on Xai.games whenever
						purchasing from Xai.
					</p>
				</div>

				{isSuccess ? (
						<div
							className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
							<div className="w-full flex justify-center">
								<FaCircleCheck color={"#16A34A"} size={32}/>
							</div>

							<p className="text-3xl font-semibold mt-4">
								Wallet successfully assigned
							</p>

							<button
								onClick={returnToClient}
								disabled={false}
								className="w-[436px] max-w-full bg-[#F30919] text-white p-4 font-semibold m-8 disabled:bg-slate-400"
							>
								Return to Xai Client
							</button>
						</div>
				) : (
					<div
						className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
						<div
							className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
							<p className="text-3xl font-semibold">
								Assign wallet
							</p>
							<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
								This will assign all purchased keys in your wallet to the Sentry Wallet. After assigning
								your wallet, you will be redirected back to the client.
							</p>
							{error && (
								<p className="text-center break-words w-full mt-4 text-red-500">
									{error.message}
								</p>
							)}
							{address ? (
								<button
									onClick={() => write()}
									disabled={isLoading || isSuccess}
									className="w-full bg-[#F30919] text-white p-4 font-semibold m-8 disabled:bg-slate-400"
								>
									Assign wallet to Sentry ({getShortenedWallet(address)})
								</button>
							) : (
								<div className="m-8">
									<w3m-button/>
								</div>
							)}

							<p className="text-[#525252]">
								Don't own any keys?
								<a
									onClick={() => navigate("/")}
									className="text-[#F30919] ml-1 cursor-pointer"
								>
									Purchase keys here
								</a>
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="absolute top-0 right-0 p-4">
				<w3m-button/>
			</div>
		</div>
	)
}
