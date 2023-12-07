import {AiOutlineCloudUpload} from "react-icons/ai";
import {FaDiscord} from 'react-icons/fa';
import {Link, useNavigate} from 'react-router-dom';
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {RiKey2Line, RiTwitterXFill} from "react-icons/ri";
import {SiGitbook} from "react-icons/si";
import {GreenPulse, YellowPulse} from "@/features/keys/StatusPulse.js";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {IoGiftOutline} from "react-icons/io5";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {useAtomValue} from "jotai";

/**
 * Sidebar component
 * @returns JSX.Element
 */
export function Sidebar() {
	const navigate = useNavigate();
	const {sentryRunning} = useOperatorRuntime();
	const {funded, hasAssignedKeys} = useAtomValue(accruingStateAtom);

	return (
		<div
			className="flex flex-col justify-between sticky h-full w-[14.625rem] min-w-[14.625rem] bg-white border-r border-gray-200 text-[15px] p-4 z-10"
		>
			<div className="fixed h-full flex flex-col gap-5">
				<div
					className="flex items-center gap-2 text-base font-semibold cursor-pointer"
					onClick={() => navigate("/")}
				>
					<XaiLogo className="w-[16px]"/>
					<h1>Xai Client</h1>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Sentry Node</h2>

					<Link
						to="/keys"
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<RiKey2Line size={15}/> Keys
					</Link>
					<Link
						to="/sentry-wallet"
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<div className="w-[15px] h-[15px] flex justify-center items-center">
							{sentryRunning && hasAssignedKeys && funded
								? <GreenPulse/>
								: <YellowPulse/>
							}
						</div>

						Sentry Wallet
					</Link>
					<Link
						to="/redeem"
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<IoGiftOutline size={15}/> Redeem
					</Link>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Help</h2>
					<a
						onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-2-download-and-run-the-xai-sentry-node")}
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<AiOutlineCloudUpload size={15}/> Set up on Cloud
					</a>
					<a
						onClick={() => window.electron.openExternal(" https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-3-complete-requirements-to-accrue-esxai")}
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<SiGitbook size={15}/> Gitbook
					</a>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Social</h2>
					<a
						onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')}
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<FaDiscord size={15}/> Discord
					</a>
					<a
						onClick={() => window.electron.openExternal('https://twitter.com/xai_games')}
						className="flex items-center mb-1 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<RiTwitterXFill size={15}/> X
					</a>
				</div>
			</div>

			<div/>
			<div>
				<p>v{import.meta.env.APP_VERSION}</p>
			</div>
		</div>
	);
}
