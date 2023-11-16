import {AiFillWarning} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {RiKey2Line} from "react-icons/ri";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";

// const noKeysCopy = [
// 	{
// 		header: "One key equals one claim",
// 		body: "Your Sentry will be able to send one claim for each key owned",
// 	},
// 	{
// 		header: "Claims are sent to challenges",
// 		body: "Sentries send claims to verification challenges on the network",
// 	},
// 	{
// 		header: "Claims receive network rewards",
// 		body: "Once the challenge is finished, winning claims receive network rewards",
// 	},
// ]

export function NoKeys() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	{/*		todo: Avo told me I can turn this off	*/
	}
	// function getKeyContent() {
	// 	return noKeysCopy.map((item, i) => {
	// 		return (
	// 			<div
	// 				key={`connect-wallet-content-${i}`}
	// 				className="max-w-sm flex flex-col justify-center bg-[#F5F5F5] p-6 rounded-lg gap-4"
	// 			>
	// 				<div className="flex flex-row items-center gap-2">
	// 					<p className="w-6 h-6 flex items-center justify-center text-lg bg-red-500 text-white rounded-full">{i + 1}</p>
	// 					<p className="text-lg font-semibold">{item.header}</p>
	// 				</div>
	// 				<p className="text-base text-[#525252]">{item.body}</p>
	// 			</div>
	// 		)
	// 	})
	// }

	return (
		<div className="w-full h-auto flex flex-col justify-center items-center">
			<div className="absolute top-0 bottom-0 flex flex-col justify-center items-center gap-4">
				<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
				<p className="text-2xl font-semibold">
					You do not own any keys
				</p>
				<p className="text-lg text-[#525252]">
					Purchase a key to be able to begin accruing esXAI
				</p>

				<button
					onClick={() => setDrawerState(DrawerView.BuyKeys)}
					className="flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-2 px-6 py-3"
				>
					<RiKey2Line className="w-5 h-5"/>
					Purchase keys
				</button>

				<p className="text-[15px] text-[#525252] mt-2">
					Already own a key?

					<a
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
						className="text-[#F30919] ml-1 cursor-pointer"
					>
						Add wallet to Xai Client
					</a>
				</p>

				{/*		todo: Avo told me I can turn this off	*/}
				{/*<div className="flex flex-col justify-center items-center mt-24">*/}
				{/*	<h3 className="text-lg font-semibold">*/}
				{/*		How keys work*/}
				{/*	</h3>*/}
				{/*	<div className="flex flex-row justify-center items-center gap-10 p-6">*/}
				{/*		{getKeyContent()}*/}
				{/*	</div>*/}
				{/*</div>*/}
			</div>
		</div>
	)
}
