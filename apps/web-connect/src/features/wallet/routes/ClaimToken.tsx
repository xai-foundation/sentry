import {useAccount, useNetwork, useContractWrite} from "wagmi";
import {useState, useEffect} from "react";
import {ConnectButton, XaiCheckbox} from "@sentry/ui";
import {useNavigate} from "react-router-dom";
import {useBlockIp} from "@/hooks/useBlockIp";
import {BiLoaderAlt} from "react-icons/bi";
import {XaiGaslessClaimAbi, config} from "@sentry/core";
import {ethers} from "ethers";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { WarningNotification } from "@sentry/ui/src/rebrand/notifications";

export function ClaimToken() {
	const {open} = useWeb3Modal()
	const {blocked, loading} = useBlockIp({blockUsa: true});
	const {address: _address} = useAccount();
	const address = _address?.toLowerCase();
	const navigate = useNavigate();
	const {chain} = useNetwork();
	const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
	const ready = checkboxOne && chain?.id === 42_161;
	// const ready = checkboxOne && chain?.id === 421614;
	const [permits, setPermits] = useState<{[key: string]: {r: string, s: string, v: number, amount: string}}>();

	const {isLoading, isSuccess, write, error} = useContractWrite({
		address: config.xaiGaslessClaimAddress as `0x${string}`,
		abi: XaiGaslessClaimAbi,
		functionName: "claimRewards",
		args: [permits && address ? permits[address]?.amount : "0", permits && address ? permits[address]?.v : "0", permits && address ? permits[address]?.r : "0", permits && address ? permits[address]?.s : "0"],
		onError(error) {
			console.warn("Error", error);
		},
	});

	useEffect(() => {
		fetch('https://cdn.xai.games/airdrop/xai-drop-permits.JSON', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(response => response.json())
			.then(data => setPermits(data));
	}, []);

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#F30919"}/>
			</div>
		)
	}

	if (blocked) {
		return (
			<div className='w-full h-screen flex justify-center items-center'>
				<p className="p-2 text-md text-white">You are in a country restricted from using this application.</p>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#F30919"}/>
			</div>
		)
	}

	if (isSuccess) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<p className="text-3xl font-bold text-white">Claim successful!</p>
			</div>
		)
	}

	return (
		<div>
			<div className="h-full min-h-screen flex-1 flex flex-col justify-center items-center">
				<div
					className="flex flex-col justify-center items-center lg:w-[744px] bg-darkLicorice shadow-main m-4 lg:p-12 sm:p-8">
					<div
						className="flex flex-col justify-center items-center gap-2 w-full overflow-hidden">
						<p className="text-3xl font-bold text-white mb-4">
							CLAIM XAI TOKENS
						</p>

						{!address && (
							<p className="text-lg text-medium text-elementalGrey max-w-[590px] text-center mt-2">
								Connect your wallet to check your eligibility.
							</p>
						)}

						{address && permits ? (
							<>
								{permits[address] ? (
									<>
										<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
											You are eligible to claim {ethers.formatEther(permits[address].amount.toString())} Xai Tokens!
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
													onClick={() => write()}
													className={`w-[576px] h-16 ${ready ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
													disabled={!ready}
												>
													{chain?.id === 42_161 ? "Claim" : "Please Switch to Arbitrum One"}
												</button>
											</div>
											{error && (
												<div className="text-center sm:w-[400px] md:w-[600px] h-[200px] p-4 overflow-y-auto break-words mt-4 text-[#F30919]">
													You will see an error if you have already claimed!
													<br/><br/>
													{error.message}
												</div>
											)}
										</div>
									</>
								) : (
										<>
										<WarningNotification title="Wallet is ineligible" showIcon text={`This wallet (${address}) is not eligible to claim any Xai Tokens. You can connect a different wallet to determine if it is
											eligible.`} />
									</>
								)}
							</>
						) : (
							<div className="m-8 w-full">
								<ConnectButton onOpen={open} address={address} isFullWidth/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
