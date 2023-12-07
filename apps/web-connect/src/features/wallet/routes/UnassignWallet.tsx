import {useNavigate, useParams} from "react-router-dom";
import {useAccount, useContractWrite} from "wagmi";
import {config, RefereeAbi} from "@sentry/core";
import {FaCircleCheck} from "react-icons/fa6";
import {XaiBanner} from "@/features/checkout/XaiBanner";

export function UnassignWallet() {
	const navigate = useNavigate();
	const params = useParams<{ operatorAddress: string }>();
	const {address} = useAccount();

	const {isLoading, isSuccess, write, error, data} = useContractWrite({
		address: config.refereeAddress as `0x${string}`,
		abi: RefereeAbi,
		functionName: "setApprovalForOperator",
		args: [params.operatorAddress, false],
		onSuccess(data) {
			window.location = `xai-sentry://unassigned-wallet?txHash=${data.hash}` as unknown as Location;
		},
		onError(error) {
			console.warn("Error", error);
		},
	});

	function getShortenedWallet(address: string) {
		const firstFiveChars = address.slice(0, 5);
		const lastThreeChars = address.slice(-5);
		return `${firstFiveChars}...${lastThreeChars}`;
	}

	function returnToClient() {
		window.location = `xai-sentry://unassigned-wallet?txHash=${data?.hash}` as unknown as Location;
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
							Wallet successfully un-assigned
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
								Un-assign wallet
							</p>
							<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
								This will un-assign all purchased keys in your wallet from the Sentry Wallet. After
								un-assigning your wallet, you will be redirected back to the client.
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
									Un-assign wallet from Sentry ({getShortenedWallet(address)})
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
		</div>
	)
}
