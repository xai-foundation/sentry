import {AiFillWarning} from "react-icons/ai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useAtom} from "jotai";

const noKeysCopy = [
	{
		header: "Lorem ipsum",
		body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec dignissim nisl.",
	},
	{
		header: "Lorem ipsum",
		body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec dignissim nisl.",
	},
	{
		header: "Lorem ipsum",
		body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec dignissim nisl.",
	},
]

export function Redeem() {
	const [drawerState, setDrawerState] = useAtom(drawerStateAtom);

	function getRedeemBody() {
		return noKeysCopy.map((item, i) => {
			return (
				<div
					key={`connect-wallet-content-${i}`}
					className="max-w-sm flex flex-col justify-center bg-[#F5F5F5] p-6 rounded-lg gap-4"
				>
					<div className="flex flex-row items-center gap-2">
						<p className="w-6 h-6 flex items-center justify-center text-lg bg-red-500 text-white rounded-full">{i + 1}</p>
						<p className="text-lg font-semibold">{item.header}</p>
					</div>
					<p className="text-base text-[#525252]">{item.body}</p>
				</div>
			)
		})
	}

	return (
		<div className="w-full h-screen">
			<div className="flex flex-row justify-between items-center border-b border-gray-200 pl-10 pr-2">
				<div className="sticky top-0 flex flex-row items-center h-16 gap-2 bg-white">
					<h2 className="text-lg font-semibold">Redeem Rewards</h2>
					<p className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
						X keys in Y wallet
					</p>
					{/*<Tooltip*/}
					{/*	header={"There's a tooltip here"}*/}
					{/*	body={"I didn't get copy for it."}*/}
					{/*	minWidth={452}*/}
					{/*>*/}
					{/*	<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>*/}
					{/*</Tooltip>*/}
				</div>

				{drawerState === null && (
					<div className="flex gap-4 bg-[#FFFBEB] p-2 z-10">
						<div className="flex flex-row gap-2 items-center">
							<AiFillWarning className="w-7 h-7 text-[#F59E28]"/>
							<span className="text-[#B45317] text-[15px] font-semibold">Actions required (Buy)</span>
						</div>
						<button
							onClick={() => setDrawerState(DrawerView.ActionsRequiredBuy)}
							className={`flex flex-row justify-center items-center py-1 px-4 gap-1 bg-[#F30919] text-[15px] text-white font-semibold`}
						>
							Resolve
						</button>
					</div>
				)}
			</div>

			<div className="w-full h-auto flex flex-col justify-center items-center">
				<div className="absolute top-0 bottom-0 flex flex-col justify-center items-center gap-4">
					<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
					<p className="text-2xl font-semibold">
						Redemptions are currently not available
					</p>
				</div>
				<div className="absolute bottom-0 flex flex-col justify-center items-center mt-24">
					<h3 className="text-lg font-semibold">
						How redemptions work
					</h3>
					<div className="flex flex-row justify-center items-center gap-10 p-6">
						{getRedeemBody()}
					</div>
				</div>
			</div>
		</div>
	)
}
