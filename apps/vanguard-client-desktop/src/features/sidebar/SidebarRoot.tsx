import {Link} from 'react-router-dom';
import {FaDiscord} from 'react-icons/fa';
import {FiGitCommit} from "react-icons/fi";
import {RiKey2Line, RiTwitterXFill} from "react-icons/ri";
import {AiOutlineCloudUpload} from "react-icons/ai";
import {SiGitbook} from "react-icons/si";
import {HiOutlineDesktopComputer} from "react-icons/hi";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";

/**
 * Sidebar component
 * @returns JSX.Element
 */
export function Sidebar() {
	return (
		<div
			className="sticky h-full w-[14.625rem] bg-white border-r border-gray-200 text-[15px] p-5 z-10">
			<div className="h-full flex flex-col gap-5">

				<div className="flex items-center gap-2 text-base font-semibold">
					<XaiLogo className="w-[16px]"/>
					<h1>Xai Client</h1>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Sentry Node</h2>

					<Link
						to="/licenses"
						className="flex items-center mb-2 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<RiKey2Line size={15}/> Keys
						{/*<span className="ml-auto bg-red-500 text-xs text-white rounded-full px-2">1</span>*/}
					</Link>

					<Link
						to="/"
						className="flex items-center mb-2 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<FiGitCommit size={15}/> Sentry Wallet
					</Link>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Help</h2>
					<a
						onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/")}
						className="flex items-center mb-2 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<AiOutlineCloudUpload size={15}/> Set up on Cloud
					</a>
					<a
						onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/")}
						className="flex items-center mb-2 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<SiGitbook size={15}/> Gitbook
					</a>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Social</h2>
					<a
						onClick={() => window.electron.openExternal('https://discord.com/invite/xaigames')}
						className="flex items-center mb-2 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<FaDiscord size={15}/> Discord
					</a>
					<a
						onClick={() => window.electron.openExternal('https://twitter.com/xai_games')}
						className="flex items-center mb-2 text-[15px] text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<RiTwitterXFill size={15}/> X
					</a>
				</div>

				<div>
					<h2 className="text-gray-400 text-[12px] mb-2 uppercase">Dev Links</h2>
					<Link
						to="/operator"
						className="flex items-center mb-2 text-[15px text-gray-600 hover:text-gray-400 cursor-pointer gap-2"
					>
						<HiOutlineDesktopComputer size={15}/> Operator
					</Link>
				</div>
			</div>
		</div>
	);
}
