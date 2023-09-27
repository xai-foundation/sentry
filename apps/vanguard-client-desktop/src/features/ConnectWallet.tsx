import {RiKey2Line} from "react-icons/ri";
import {FiGift, FiGitCommit} from "react-icons/fi";
import {Link} from "@tanstack/react-router";

const body = [
	{
		icon: <RiKey2Line className="w-8 h-8 text-[#FF5E69]"/>,
		header: "Purchase licenses",
		body: "The more licenses you own, the more challenges you can participate in",
	},
	{
		icon: <FiGitCommit className="w-8 h-8 text-[#FF5E69]"/>,
		header: "Keep your node running",
		body: "Your node will connect you to Xai network challenges",
	},
	{
		icon: <FiGift className="w-8 h-8 text-[#FF5E69]"/>,
		header: "Earn network rewards",
		body: "Over time you will earn rewards from network challenges",
	},
]

export function ConnectWallet() {

	function getBody() {
		return body.map((item, i) => {
			return (
				<div
					key={`connect-wallet-content-${i}`}
					className="w-72 flex flex-col justify-center items-center text-center"
				>
					{item.icon}
					<p className="text-lg font-semibold mt-8">{item.header}</p>
					<p className="text-base text-[#525252]">{item.body}</p>
				</div>
			)
		})

	}

	return (
		<div className="relative w-full h-screen flex flex-col items-center gap-20 pt-52">
			<div className="flex flex-col justify-center items-center gap-2 z-10">
				<h1 className="text-[40px] font-bold uppercase tracking-widest">Connect your wallet</h1>
				<p className="text-lg text-[#525252] max-w-[508px] text-center">
					Start your Xai Vanguard Node by connecting your wallet, and begin participating in network
					challenges
				</p>
			</div>

			<div className="flex flex-col justify-center items-center gap-4 z-10">
				{/*<button*/}
				{/*	onClick={() => alert("lol you thought we had functionality")}*/}
				{/*	className="w-96 bg-[#F30919] text-white p-4 uppercase font-semibold"*/}
				{/*>*/}
				{/*	Connect Wallet*/}
				{/*</button>*/}

				<Link
					to="/licenses"
					className="w-96 bg-[#F30919] flex justify-center items-center text-white p-4 uppercase font-semibold cursor-pointer"
				>
					Connect Wallet
				</Link>

				<p className="text-xs text-[#525252]">This will open WalletConnect in a browser</p>
			</div>

			<div className="flex flex-row justify-center items-center gap-32 z-10">
				{getBody()}
			</div>

			<video
				className="absolute bottom-[-15rem] w-full object-cover"
				autoPlay
				loop
				muted
				playsInline
			>
				<source src="https://cdn.xai.games/v3-vanguard/vanguard-bg.mp4" type="video/mp4"/>
			</video>
		</div>
	)
}
