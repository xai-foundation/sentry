import {useNavigate, useParams} from "react-router-dom";
import {useAccount, useContractWrite, useNetwork} from "wagmi";
import {config, RefereeAbi} from "@sentry/core";
import {FaCircleCheck} from "react-icons/fa6";
import {ConnectButton, PrimaryButton} from "@sentry/ui";
import {useWeb3Modal} from "@web3modal/wagmi/react";

export function UnassignWallet() {
	const {open} = useWeb3Modal()
	const navigate = useNavigate();
	const params = useParams<{ operatorAddress: string }>();
	const {isConnected, address} = useAccount();
	const {chain} = useNetwork();

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
			<div className="h-full min-h-screen flex-1 flex flex-col justify-center items-center px-[33px]">
				{isSuccess ? (
					<div
						className="flex flex-col justify-center items-center lg:w-[744px] bg-darkLicorice lg:p-12 sm:p-4 shadow-main">
						<div className="w-full flex justify-center">
							<FaCircleCheck color={"#16A34A"} size={64}/>
						</div>

						<p className="sm:max-w-[190px] lg:max-w-full text-3xl font-bold mt-4 uppercase text-white sm:text-center">
							Wallet successfully un-assigned
						</p>

						<PrimaryButton onClick={returnToClient} btnText={"Return to Xai Client"} colorStyle="primary" className="mt-8 w-full uppercase font-bold text-xl text-white" isDisabled={false} />
					</div>
				) : (
					<div
						className="flex flex-col justify-center items-center w-full max-w-[800px] bg-potBlack/75 m-4 lg:p-12 p-8 wrapper-drop-shadow">
						<div
							className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
							<p className="text-3xl font-bold uppercase text-white">
								Unassign wallet
							</p>
							<p className="text-lg text-elementalGrey font-medium max-w-[590px] text-center mt-2">
								This will un-assign all purchased keys in your wallet from the Sentry Wallet. After
								un-assigning your wallet, you will be redirected back to the client.
							</p>
							{error && (
								<div className="text-center sm:w-[400px] md:w-[600px] h-[200px] p-4 overflow-y-auto break-words mt-4 text-[#F30919]">
									{error.message}
								</div>
							)}
							{isConnected && address ? (
								<PrimaryButton
									onClick={() => write()}
									isDisabled={isLoading || isSuccess || chain?.id !== 42_161}
									btnText={chain?.id === 42_161 ? `Unassign wallet to Sentry (${getShortenedWallet(address)})` : "Please Switch to Arbitrum One"}
									colorStyle={"primary"}
									className={"w-full bg-[#F30919] max-w-[700px] text-white mt-3 text-xl uppercase font-bold disabled:bg-slate-400 h-full global-clip-primary-btn"}
								/>
							) : (
								<div className="mt-6 w-full">
									<ConnectButton address={address} onOpen={open} isFullWidth/>
								</div>
							)}

							<p className="text-americanSilver lg:text-lg text-base font-medium mt-6">
								Don't own any keys?
								<a
									onClick={() => navigate("/")}
									className="font-bold text-hornetSting lg:text-lg text-base ml-[5px] cursor-pointer"
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
