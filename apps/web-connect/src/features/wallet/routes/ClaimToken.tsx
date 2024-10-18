import {useWriteContract } from "wagmi";
import {chains} from "../../../main";
import {useState, useEffect} from "react";
import {ConnectButton, XaiCheckbox} from "@sentry/ui";
import {useNavigate} from "react-router-dom";
import {useBlockIp} from "@/hooks/useBlockIp";
import {BiLoaderAlt} from "react-icons/bi";
import { XaiGaslessClaimAbi, config, isValidNetwork} from "@sentry/core";
import {ethers} from "ethers";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { WarningNotification } from "@sentry/ui/src/rebrand/notifications";
import IpBlockText from "@sentry/ui/src/rebrand/text/IpBlockText";
import { useNetworkConfig } from "@/hooks/useNetworkConfig";


export function ClaimToken() {
	const {open} = useWeb3Modal()
	const {blocked, loading} = useBlockIp({blockUsa: true});
    const { chainId, address:_address, isDevelopment} = useNetworkConfig();
	const address = _address?.toLowerCase();
	const navigate = useNavigate();
	const chain = chains.find(chain => chain.id === chainId)
	const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
	const ready = checkboxOne && isValidNetwork(chain?.id, isDevelopment);
	const [permits, setPermits] = useState<{[key: string]: {r: string, s: string, v: number, amount: string}}>();

	const txData = {
		address: config.xaiGaslessClaimAddress as `0x${string}`,
		abi: XaiGaslessClaimAbi,
		functionName: "claimRewards",
		args: [permits && address ? permits[address]?.amount : "0", permits && address ? permits[address]?.v : "0", permits && address ? permits[address]?.r : "0", permits && address ? permits[address]?.s : "0"],
		onSuccess(data : any) {
			window.location = `xai-sentry://unassigned-wallet?txHash=${data.hash}` as unknown as Location;
		},
		onError(error: any) {
			console.warn("Error", error);
		}
	};

	const {isPending: isLoading, isSuccess, writeContract, error} = useWriteContract();

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
				<IpBlockText classNames="p-2 text-md text-white" />
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

	function handleConnectClick() {
		open();
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
													onClick={() => writeContract(txData)}
													className={`w-[576px] h-16 ${ready ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
													disabled={!ready}
												>
													{(isValidNetwork(chain?.id, isDevelopment)) ? "Claim" : "Please Switch to Arbitrum"}
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
								<ConnectButton onOpen={handleConnectClick} address={address} isFullWidth/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
