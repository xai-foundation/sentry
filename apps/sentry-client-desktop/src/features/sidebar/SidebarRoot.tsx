import {AiOutlineCloudUpload} from "react-icons/ai";
import {FaDiscord} from 'react-icons/fa';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {RiKey2Line, RiTwitterXFill} from "react-icons/ri";
import {SiGitbook} from "react-icons/si";
import {GreenPulse, GreyPulse, YellowPulse} from "@/features/keys/StatusPulse.js";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useAtomValue} from "jotai";
import {MdOutlineSpaceDashboard} from "react-icons/md";
import { TelegramIcon, XaiHeaderIcon } from "../../../../../packages/ui/src/rebrand/icons/IconsComponents";

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
			return "bg-btnPrimaryBgColor global-clip-path text-white";
		}
		return "";
	}

	return (
		<div
			className="flex flex-col justify-between sticky h-full w-[14.625rem] min-w-[14.625rem] text-[15px] z-10"
		>
			<div className="fixed h-full flex flex-col gap-9">
				<div
					className="flex group items-centertext-base w-[5rem] h-[5rem] font-semibold cursor-pointer bg-btnPrimaryBgColor hover:bg-white duration-200 ease-in px-[20px] py-[23px]"
					onClick={() => navigate("/")}
				>
					<XaiHeaderIcon width={39} height={34} />
				</div>

				<div className="w-[14.625rem] mb-[184px]">
					<Link
						to="/dashboard"
						className={`flex items-center mb-[11px] text-xl text-white font-bold  cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-linkBgHover ${getActiveLink('/dashboard')}`}
					>
						<MdOutlineSpaceDashboard size={20}/> DASHBOARD
					</Link>

					<Link
						to="/keys"
						className={`flex items-center w-[14.625rem] mb-[11px] text-xl text-white font-bold cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-linkBgHover ${getActiveLink('/keys')}`}
					>
						<RiKey2Line size={20}/> KEYS
					</Link>

					<Link
						to="/sentry-wallet"
						className={`flex items-center w-[14.625rem] mb-[11px] text-xl text-white font-bold cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-linkBgHover ${getActiveLink('/sentry-wallet')}`}
					>
						<div className="w-auto h-auto flex justify-center items-center">
							{sentryRunning && hasAssignedKeys && funded && <GreenPulse size='md' />}
							{sentryRunning && !hasAssignedKeys && !funded && <YellowPulse size='md' />}
							{!sentryRunning && <GreyPulse size='md' />}
						</div>
						SENTRY WALLET
					</Link>
					<a
						onClick={() => window.electron.openExternal('https://app.xai.games')}
						className="flex items-center w-[14.625rem] mb-1 text-xl text-white font-bold cursor-pointer gap-2 py-[11px] pl-[17px] hover:global-clip-path hover:bg-linkBgHover"
					>
						<XaiHeaderIcon width={20} height={20}/> STAKING
					</a>
				</div>

				<div className="px-[17px]">
					<a
						onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-2-download-and-run-the-xai-sentry-node")}
						className="flex items-center mb-[11px] text-base font-medium text-white cursor-pointer gap-2 hover:text-btnPrimaryBgColor duration-200 ease-in"
					>
						<AiOutlineCloudUpload size={16}/> SET UP ON CLOUD
					</a>
					<a
						onClick={() => window.electron.openExternal(" https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-3-complete-requirements-to-accrue-esxai")}
						className="flex items-center mb-[11px] text-base font-medium text-white cursor-pointer gap-2 hover:text-btnPrimaryBgColor duration-200 ease-in"
					>
						<SiGitbook size={16}/> GITBOOK
					</a>

					<a
						onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')}
						className="flex items-center mb-[11px] text-base font-medium text-white cursor-pointer gap-2 hover:text-btnPrimaryBgColor duration-200 ease-in"
					>
						<FaDiscord size={16}/> DISCORD
					</a>
					<a
						onClick={() => window.electron.openExternal('https://twitter.com/xai_games')}
						className="flex items-center mb-[11px] text-base font-medium text-white cursor-pointer gap-2 hover:text-btnPrimaryBgColor duration-200 ease-in"
					>
						<RiTwitterXFill size={16}/> X
					</a>
					<a
						onClick={() => window.electron.openExternal('https://twitter.com/xai_games')}
						className="flex group items-center mb-[21px] text-base font-medium text-white cursor-pointer gap-2 hover:text-btnPrimaryBgColor duration-200 ease-in"
					>
						<TelegramIcon width={16} height={16} className="fill-white group-hover:fill-btnPrimaryBgColor duration-200 ease-in"/> TELEGRAM
					</a>
				<a
					className="text-secondaryText text-[15px] cursor-pointer hover:underline duration-200 ease-in"
					onClick={() => window.electron.openExternal("https://xai.games/sentry-node-agreement")}
				>
					SENTRY NODE AGREEMENT
					</a>
					<div className="text-secondaryText text-[15px] mt-[21px]">
						<p>v1.1.13-sepolia </p>
						<p>©2024 XAI. ALL RIGHTS RESERVED</p>
					</div>
				</div>
			</div>
			<div/>
		</div>
	);
}
