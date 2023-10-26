import {MdVerifiedUser} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {useAccount} from "wagmi";

export function AssignWallet() {
	const {address} = useAccount()
	const navigate = useNavigate();

	function getShortenedPrivateKey(address: string) {
		const firstFiveChars = address.slice(0, 5);
		const lastThreeChars = address.slice(-5);
		return `${firstFiveChars}...${lastThreeChars}`;
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


				<div
					className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
					<div
						className="flex flex-col justify-center items-center gap-2">
						<p className="text-3xl font-semibold">
							Assign wallet
						</p>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
							This will assign all purchased keys in your wallet to the Sentry Wallet. After assigning
							your wallet, you will redirected back to the client.
						</p>
						{address ? (

							<button
								onClick={() => alert("Assign wallet")}
								className="w-[672px] bg-[#F30919] text-white p-4 font-semibold m-8"
							>
								Assign wallet to Sentry ({getShortenedPrivateKey(address)})
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
			</div>

			<div className="absolute top-0 right-0 p-4">
				<w3m-button/>
			</div>
		</div>
	)
}
