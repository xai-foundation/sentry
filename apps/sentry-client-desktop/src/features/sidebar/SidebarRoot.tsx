import {AiOutlineCloudUpload} from "react-icons/ai";
import {FaDiscord} from 'react-icons/fa';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {RiKey2Line, RiTwitterXFill} from "react-icons/ri";
import {SiGitbook} from "react-icons/si";
import {GreenPulse, GreyPulse, YellowPulse} from "@/features/keys/StatusPulse.js";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useAtomValue} from "jotai";
import { TelegramIcon, XaiHeaderIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import DashboardIconWhite from "@/assets/images/dashboard-icon-white.png";
import DashboardIconGrey from "@/assets/images/dashboard-icon-grey.png";
import { useStorage } from "@/features/storage";
import ExternalLinkIcon from "@sentry/ui/dist/src/rebrand/icons/ExternalLinkIcon";

/**
 * Sidebar component
 * @returns JSX.Element
 */
export function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	const {sentryRunning} = useOperatorRuntime();
	const { funded, hasAssignedKeys } = useAtomValue(accruingStateAtom);
	const {data} = useStorage();
	const getActiveLink = (url: string) => {
		if(location.pathname.includes(url)) {
			return "bg-hornetSting global-clip-path text-white";
		}
		return "";
	}
		
	return (
		<div
			className="flex flex-col justify-between sticky h-full w-[237px] min-w-[237px] text-[15px] z-10"
		>
			<div className="fixed flex flex-col">
				<div
					className="flex group items-centertext-base w-[5rem] h-[5rem] mb-[37px] font-semibold cursor-pointer bg-hornetSting hover:bg-white duration-200 ease-in px-[20px] py-[23px]"
					onClick={() => navigate("/")}
				>
					<XaiHeaderIcon width={39} height={34} fill="fill-white" />
				</div>

				<div className="w-[237px] mb-[110px]">
					<Link
						to={data?.addedWallets?.length && data.addedWallets.length > 0 ? "/dashboard" : "#"}
						className={`flex items-center w-[237px] text-xl font-bold ${data?.addedWallets?.length && data.addedWallets.length > 0 ? `text-white cursor-pointer hover:global-clip-path hover:bg-darkRoom ${getActiveLink('/dashboard')}` : "text-foggyLondon cursor-auto"} gap-2 py-[11px] pl-[17px]`}
					>
						{data?.addedWallets?.length && data.addedWallets.length > 0 ? <img src={DashboardIconWhite} width={14} height={14} className="ml-1" /> : <img src={DashboardIconGrey} width={14} height={14} className="ml-1" />} DASHBOARD
					</Link>

					<Link
						to={data?.addedWallets?.length && data.addedWallets.length > 0 ? "/keys" : "#"}
						className={`flex items-center w-[237px] text-xl font-bold ${data?.addedWallets?.length && data.addedWallets.length > 0 ? `text-white cursor-pointer hover:global-clip-path hover:bg-darkRoom ${getActiveLink('/keys')}` : "text-foggyLondon cursor-auto"} gap-2 py-[11px] pl-[17px]`}
					>
						<RiKey2Line size={20}/> KEYS
					</Link>

					<Link
						to={data?.addedWallets?.length && data.addedWallets.length > 0 ? "/sentry-wallet" : "#"}
						className={`flex items-center w-[237px] text-xl font-bold ${data?.addedWallets?.length && data.addedWallets.length > 0 ? `text-white cursor-pointer hover:global-clip-path hover:bg-darkRoom ${getActiveLink('/sentry-wallet')}` : "text-foggyLondon cursor-auto"} gap-2 py-[11px] pl-[17px]`}
					>
						<div className="w-auto h-auto flex justify-center items-center">
							{sentryRunning && !!data?.addedWallets?.length && data?.addedWallets?.length !== 0 && hasAssignedKeys && funded && <GreenPulse size='lg' />}
							{sentryRunning && !!data?.addedWallets?.length && data?.addedWallets?.length !== 0 && (!hasAssignedKeys || !funded) && <YellowPulse size='lg' />}
							{(!sentryRunning || !data?.addedWallets?.length || data?.addedWallets?.length === 0) && <GreyPulse size='lg' />}
						</div>
						SENTRY WALLET
					</Link>
					<a
						onClick={() => data?.addedWallets?.length && data.addedWallets.length > 0 && window.electron.openExternal('https://app.xai.games')}
						className={`flex items-center w-[237px] text-xl font-bold ${data?.addedWallets?.length && data.addedWallets.length > 0 ? `text-white cursor-pointer hover:global-clip-path hover:bg-darkRoom` : "text-foggyLondon cursor-auto"} gap-2 py-[11px] pl-[17px]`}
					>
						<XaiHeaderIcon extraClasses="mt-[-4px]" width={20} height={20} fill={`${!data?.addedWallets?.length ? "fill-foggyLondon" : "fill-white"}`} />
						STAKING
						<ExternalLinkIcon
						extraClasses={{svgClasses: "mt-[-4px]", pathClasses: `${!data?.addedWallets?.length ? "fill-foggyLondon" : "fill-white"}`}}
					/>
					</a>
				</div>

				<div className="px-[17px]">
					<a
						onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/about-xai/sentry-node-purchase-and-setup/common-troubleshooting-steps/how-do-i-run-a-xai-node-on-vps")}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<AiOutlineCloudUpload size={20}/> SET UP ON CLOUD
					</a>
					<a
						onClick={() => window.electron.openExternal(" https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-3-complete-requirements-to-accrue-esxai")}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<SiGitbook size={20}/> GITBOOK
					</a>

					<a
						onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<FaDiscord size={20}/> DISCORD
					</a>
					<a
						onClick={() => window.electron.openExternal('https://twitter.com/xai_games')}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<RiTwitterXFill size={20}/> X
					</a>
					<a
						onClick={() => window.electron.openExternal('https://t.me/XaiSentryNodes')}
						className="flex group items-center mb-[20px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<TelegramIcon width={18} height={16} className="fill-white group-hover:fill-hornetSting duration-200 ease-in"/> TELEGRAM
					</a>
				<a
					className="text-elementalGrey text-[15px] cursor-pointer hover:underline duration-200 ease-in"
					onClick={() => window.electron.openExternal("https://xai.games/sentry-node-agreement")}
				>
					SENTRY NODE AGREEMENT
					</a>
					<div className="text-elementalGrey text-[15px] mt-[20px]">
						<p>v{import.meta.env.APP_VERSION}</p>
						<p>©2024 XAI. ALL RIGHTS RESERVED</p>
					</div>
				</div>
			</div>
			<div/>
		</div>
	);
}
