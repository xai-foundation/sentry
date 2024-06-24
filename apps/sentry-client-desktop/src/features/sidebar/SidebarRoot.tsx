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
import DashboardIcon from "@/assets/images/dashboard-icon-white.png";

/**
 * Sidebar component
 * @returns JSX.Element
 */
export function Sidebar() {
	const navigate = useNavigate();
	const location = useLocation();
	const {sentryRunning} = useOperatorRuntime();
	const { funded, hasAssignedKeys } = useAtomValue(accruingStateAtom);
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
					<XaiHeaderIcon width={39} height={34} />
				</div>

				<div className="w-[237px] mb-[145px]">
					<Link
						to="/dashboard"
						className={`flex items-center w-[253px] text-xl text-white font-bold  cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-darkRoom ${getActiveLink('/dashboard')}`}
					>
						<img src={DashboardIcon} width={14} height={14} className="ml-1"/> DASHBOARD
					</Link>

					<Link
						to="/keys"
						className={`flex items-center w-[253px] text-xl text-white font-bold cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-darkRoom ${getActiveLink('/keys')}`}
					>
						<RiKey2Line size={20}/> KEYS
					</Link>

					<Link
						to="/sentry-wallet"
						className={`flex items-center w-[253px] text-xl text-white font-bold cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-darkRoom ${getActiveLink('/sentry-wallet')}`}
					>
						<div className="w-auto h-auto flex justify-center items-center">
							{sentryRunning && hasAssignedKeys && funded && <GreenPulse size='lg' />}
							{sentryRunning && !hasAssignedKeys && !funded && <YellowPulse size='lg' />}
							{!sentryRunning && <GreyPulse size='lg' />}
						</div>
						SENTRY WALLET
					</Link>
					<a
						onClick={() => window.electron.openExternal('https://app.xai.games')}
						className="flex items-center w-[253px] mb-1 text-xl text-white font-bold cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-darkRoom"
					>
						<XaiHeaderIcon width={20} height={20}/> STAKING
					</a>
				</div>

				<div className="px-[17px]">
					<a
						onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/about-xai/sentry-node-purchase-and-setup/common-troubleshooting-steps/how-do-i-run-a-xai-node-on-vps")}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<AiOutlineCloudUpload size={16}/> SET UP ON CLOUD
					</a>
					<a
						onClick={() => window.electron.openExternal(" https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-3-complete-requirements-to-accrue-esxai")}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<SiGitbook size={16}/> GITBOOK
					</a>

					<a
						onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<FaDiscord size={16}/> DISCORD
					</a>
					<a
						onClick={() => window.electron.openExternal('https://twitter.com/xai_games')}
						className="flex items-center mb-[5px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<RiTwitterXFill size={16}/> X
					</a>
					<a
						onClick={() => window.electron.openExternal('https://t.me/XaiSentryNodes')}
						className="flex group items-center mb-[20px] text-base font-medium text-white cursor-pointer gap-2 hover:text-hornetSting duration-200 ease-in"
					>
						<TelegramIcon width={16} height={16} className="fill-white group-hover:fill-hornetSting duration-200 ease-in"/> TELEGRAM
					</a>
				<a
					className="text-elementalGrey text-[15px] cursor-pointer hover:underline duration-200 ease-in"
					onClick={() => window.electron.openExternal("https://xai.games/sentry-node-agreement")}
				>
					SENTRY NODE AGREEMENT
					</a>
					<div className="text-elementalGrey text-[15px] mt-[20px]">
						<p>v1.1.13-sepolia </p>
						<p>©2024 XAI. ALL RIGHTS RESERVED</p>
					</div>
				</div>
			</div>
			<div/>
		</div>
	);
}
