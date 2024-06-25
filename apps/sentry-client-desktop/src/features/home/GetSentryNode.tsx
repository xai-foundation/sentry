import {RiKey2Line} from "react-icons/ri";
import {FiGift, FiGitCommit} from "react-icons/fi";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import {useSetAtom} from "jotai";
import {PrimaryButton} from "@sentry/ui";
import img from '@/assets/images/dashboard-card.png';
import {TextButton} from "@sentry/ui/dist/src/rebrand/buttons/TextButton";


const body = [
	{
		icon: <RiKey2Line className="w-8 h-8 text-[#FF012F] mb-2"/>,
		header: "PURCHASE KEYS",
		body: "The more keys you own, the more esXAI you will earn",
	},
	{
		icon: <FiGitCommit className="w-8 h-8 text-[#FF012F] mb-2"/>,
		header: "KEEP YOUR NODE RUNNING",
		body: "Your node will connect you to Xai network challenges",
	},
	{
		icon: <FiGift className="w-8 h-8 text-[#FF012F] mb-2"/>,
		header: "EARN esXAI",
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
					className="flex flex-col mr-[75px] max-w-[235px]"
				>
					{item.icon}
					<p className="text-xl text-white font-bold mt-2">{item.header}</p>
					<p className="text-lg text-americanSilver">{item.body}</p>
				</div>
			);
		});
	}

	return (
		<div className="pl-[15px]">
		<div className="w-full flex flex-row bg-nulnOil h-screen pt-[250px] pl-[97px]">
			<div className="flex flex-col z-10 w-full">
				<div className="flex gap-1 items-center">
					<h1 className="text-[30px] font-bold text-white uppercase">
						Get a Xai Sentry Node
					</h1>
				</div>

				<span className="text-lg text-americanSilver mt-4">
					Purchase a key to begin earning esXAI
				</span>
				<div className="flex items-center justify-start mt-5 gap-7 mb-[120px]">
					<div className="max-w-[202px]">
					<PrimaryButton
						onClick={() => setDrawerState(DrawerView.BuyKeys)}
						btnText="Purchase Key"
						className="w-[202px] text-[20px] uppercase !py-1 !global-cta-clip-path text-melanzaneBlack"
					/>
                    </div>
					<TextButton
						className="text-xl text-pelati cursor-pointer font-bold"
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
						buttonText={"I already own a key"}
					/>

				</div>

				<div className="flex flex-row items-center w-full">
					{getBody()}
				</div>
			</div>
            <img src={img} alt="logo" className="fixed w-full scale-[1.2] translate-x-[7%] translate-y-[-20%] h-screen left-0 object-cover" />
		</div>
		</div>
	);
}
