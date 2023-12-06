import {ReactComponent as XaiLogo} from "@/svgs/xai-logo-full.svg";
import {FaDiscord, FaTelegram} from "react-icons/fa";
import {SiGitbook} from "react-icons/si";
import {FaXTwitter} from "react-icons/fa6";

const bodyContent = {
	socials: [
		{
			label: "Discord",
			link: "https://discord.com/invite/xaigames",
			icon: <FaDiscord size={24}/>,
		},
		{
			label: "X",
			link: "https://twitter.com/xai_games",
			icon: <FaXTwitter size={24}/>,
			// icon: <XLogo style={{padding: "0.15rem"}}/>,
		},
		{
			label: "Gitbook",
			link: "https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup",
			icon: <SiGitbook size={24}/>,
		},
		{
			label: "Telegram",
			link: "https://t.me/XaiSentryNodes",
			icon: <FaTelegram size={24}/>,
		},
	],
};

export function Footer() {
	function createSocialElement(item: any) {
		function _onClickHelper() {
			window.open(item.link, "_blank", "noopener noreferrer");
		}

		return (
			<div
				key={item.label}
				className="transition-colors duration-300 ease-in-out"
				onClick={_onClickHelper}
			>
				<div className="aspect-w-1 aspect-h-1">
					<div className="w-full h-full object-contain">
						{item.icon}
					</div>
				</div>
			</div>
		);
	}

	return (
		<footer className="w-full flex justify-center items-center bg-white py-6">
			<div className="w-full max-w-[1400px] flex flex-col gap-5 px-[15px]">
				<div className="flex flex-col gap-1">
					<div className="w-16">
						<div className="w-[4.5rem] h-full object-contain">
							<XaiLogo/>
						</div>
					</div>
				</div>

				<div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-8">
					<div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
						<div>
							<p>©2023 XAI. All Rights Reserved</p>
						</div>

						<div className="flex items-center gap-2">
							<p className="hidden md:inline">|</p>
							<a
								className="text-blue-500 hover:underline"
								onClick={() => window.open("https://xai.games/sentrynodeagreement/", "_blank", "noopener noreferrer")}
							>
								Sentry Node Agreement
							</a>
						</div>
					</div>

					<div className="flex gap-4">
						{bodyContent.socials.map(createSocialElement)}
					</div>
				</div>
			</div>
		</footer>
	);
}
