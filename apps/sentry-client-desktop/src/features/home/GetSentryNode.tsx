import {RiKey2Line} from "react-icons/ri";
import {FiGift, FiGitCommit} from "react-icons/fi";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useSetAtom} from "jotai";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {GetSentryNodeTooltip} from "@/features/keys/GetSentryNodeTooltip";
import {XaiButton} from "@sentry/ui";
// import {useState} from "react";

const body = [
	{
		icon: <RiKey2Line className="w-8 h-8 text-[#FF5E69] mb-2"/>,
		header: "Purchase keys",
		body: "The more keys you own, the more esXAI you will earn",
	},
	{
		icon: <FiGitCommit className="w-8 h-8 text-[#FF5E69] mb-2"/>,
		header: "Keep your node running",
		body: "Your node will connect you to Xai network challenges",
	},
	{
		icon: <FiGift className="w-8 h-8 text-[#FF5E69] mb-2"/>,
		header: "Earn esXAI",
		body: "Over time you will earn esXAI from network challenges",
	},
];

export function GetSentryNode() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	function getBody() {
		return body.map((item, i) => {
			return (
				<div
					key={`connect-wallet-content-${i}`}
					className="w-[272px] flex flex-col"
				>
					{item.icon}
					<p className="text-lg font-semibold mt-2">{item.header}</p>
					<p className="text-base text-[#525252]">{item.body}</p>
				</div>
			);
		});
	}

	return (
		<div className="w-full flex flex-row items-center justify-between px-[2.8rem] pt-[5.625rem]">
			<div className="flex flex-col">
				<div className="flex gap-1 items-center">
					<h1 className="text-[40px] font-bold uppercase tracking-widest">
						Get a Xai Sentry Node
					</h1>
					<GetSentryNodeTooltip
						width={436}
					>
						<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
					</GetSentryNodeTooltip>
				</div>

				<span className="text-xl font-semibold mt-[8.5rem]">
					Get started
				</span>
				<span className="text-lg text-[#525252]">
					Purchase a key to begin earning esXAI
				</span>
				<div className="flex items-center mt-4 gap-[3rem]">
					<XaiButton
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
						width={"27.25rem"}
					>
						<RiKey2Line className="w-5 h-5"/>
						Purchase Key
					</XaiButton>

					<p
						className="text-xl text-[#F30919] cursor-pointer font-semibold"
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
					>
						I already own a key
					</p>
				</div>

				{/* <div>
					<span>{JSON.stringify(message)}</span>
				</div> */}

				<div className="flex flex-row items-center mt-[4.375rem]">
					{getBody()}
				</div>
			</div>

			<video
				className="fixed bottom-[-10rem] left-0 w-screen object-cover -z-10"
				autoPlay
				loop
				muted
				playsInline
			>
				<source src="/videos/node-bg-4k.mp4" type="video/mp4"/>
			</video>
		</div>
	);
}
