import {RiKey2Line} from "react-icons/ri";
import {FiGift, FiGitCommit} from "react-icons/fi";
import {Dispatch, SetStateAction} from "react";
import {AiFillInfoCircle} from "react-icons/ai";

const body = [
	{
		icon: <RiKey2Line className="w-8 h-8 text-[#FF5E69] mb-2"/>,
		header: "Purchase keys",
		body: "The more keys you own, the more rewards you will earn",
	},
	{
		icon: <FiGitCommit className="w-8 h-8 text-[#FF5E69] mb-2"/>,
		header: "Keep your node running",
		body: "Your node will connect you to Xai network challenges",
	},
	{
		icon: <FiGift className="w-8 h-8 text-[#FF5E69] mb-2"/>,
		header: "Earn network rewards",
		body: "Over time you will earn rewards from network challenges",
	},
]


const sentryBody = [
	{
		header: "Observation node",
		body: "The Sentry Node is an observation node that monitors the Xai rollup protocol",
	},
	{
		header: "Solves the verifiers dilemma",
		body: "If an incorrect block is proposed, the node will raise the alarm by whatever means the operator chooses",
	},
	{
		header: "Sentry Nodes can receive network rewards",
		body: "As long as the node is running, a probabilistic algorithm determines if nodes will receive network rewards",
	},
	{
		header: "Can be run on computers or the cloud",
		body: "Sentry Nodes can be run on any laptop, desktop, or even on cloud instances",
	},
]


interface ConnectWalletProps {
	setConnected: Dispatch<SetStateAction<boolean>>;
}

export function GetSentryNode({setConnected}: ConnectWalletProps) {
	function getBody() {
		return body.map((item, i) => {
			return (
				<div
					key={`connect-wallet-content-${i}`}
					className="w-72 flex flex-col"
				>
					{item.icon}
					<p className="text-lg font-semibold mt-2">{item.header}</p>
					<p className="text-base text-[#525252]">{item.body}</p>
				</div>
			)
		})
	}

	function getSentryNodeBody() {
		return sentryBody.map((item, i) => {
			return (
				<div
					key={`connect-wallet-content-${i}`}
					className="flex flex-col gap-2"
				>
					<p className="text-base font-semibold">{item.header}</p>
					<p className="text-[15px] text-[#525252]">{item.body}</p>
				</div>
			)
		})
	}

	return (
		<div className="max-w-[1920px] flex flex-row items-center justify-between px-[5.125rem] pt-[5.625rem] overflow-hidden">
			<div className="flex flex-col">
				<h1 className="text-[40px] font-bold uppercase tracking-widest">
					Get a Xai Sentry Node
				</h1>

				<span className="text-xl font-semibold mt-[8.5rem]">
					Get started
				</span>
				<span className="text-lg text-[#525252]">
					Purchase a key to begin earning rewards
				</span>
				<div className="flex items-center mt-4 gap-[3.375rem]">
					<button
						className={`w-[27.25rem] bg-[#F30919] flex justify-center items-center gap-2 text-lg text-white py-5 font-semibold mt-2`}
						onClick={() => setConnected(true)}
					>
						<RiKey2Line className="w-5 h-5"/>
						Purchase Key
					</button>
					<p className="text-xl text-[#F30919]">I already own a key</p>
				</div>

				<div className="flex flex-row items-center mt-[4.375rem] gap-[2rem]">
					{getBody()}
				</div>
			</div>

			<div>
				<div className="w-[436px] p-[2rem] bg-[#F5F5F5]">
					<span className="flex items-center font-semibold gap-2 mb-4">
						<AiFillInfoCircle size={18} className="text-lg text-[#A3A3A3]"/>
						What is a Sentry Node?
					</span>

					<div className="flex flex-col items-center gap-[24px]">
						{getSentryNodeBody()}
					</div>

					<p className="mt-[14px] text-[15px] text-[#525252]">
						Want to learn more about Sentry Node technical specifications?

						<a
							onClick={() => window.electron.openExternal('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
							className="text-[#F30919] ml-1 cursor-pointer"
						>
							Learn more
						</a>
					</p>

				</div>
			</div>


			<video
				className="fixed bottom-[-10rem] left-0 w-screen object-cover -z-10"
				autoPlay
				loop
				muted
				playsInline
			>
				<source src="/public/videos/node-bg-4k.mp4" type="video/mp4"/>
			</video>
		</div>
	)
}
