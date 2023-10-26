import {MdVerifiedUser} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {useAccount} from "wagmi";
import {FaCircleCheck} from "react-icons/fa6";

export function ConnectWallet() {
	const {address} = useAccount()
	const navigate = useNavigate();

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


				{address ? (
					<div
						className="flex flex-col justify-center items-center w-[744px] h-[270px] border border-gray-200 bg-white m-4">
						<div
							className="flex flex-col justify-center items-center gap-2">
							<FaCircleCheck color={"#16A34A"} size={32}/>
							<span className="text-2xl font-semibold mt-2">Wallet successfully connected</span>

							<button
								onClick={() => alert("Return to Xai")}
								className="w-[436px] bg-[#F30919] text-white p-4 font-semibold mt-8"
							>
								Return to Xai Client
							</button>
						</div>
					</div>
				) : (
					<div
						className="flex flex-col justify-center items-center w-[744px] border border-gray-200 bg-white m-4 p-12">
						<div className="flex flex-col justify-center items-center gap-4">
							<p className="text-3xl font-semibold">
								Connect Wallet
							</p>
							<p className="text-lg text-[#525252] max-w-[590px]">
								This enables viewing purchased Xai Sentry Keys in the Xai Client.
								<br/>
								After connecting your wallet, you will redirected back to the client.
							</p>

							<div className="m-8">
								<w3m-button/>
							</div>

							<p className="text-[#525252] mt-2">
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
