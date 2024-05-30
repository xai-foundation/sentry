import {ConnectButton, ExternalLink} from "@sentry/ui";
import {useWeb3Modal} from "@web3modal/wagmi/react";
import {useAccount} from "wagmi";
import {DiscordIcon, TelegramIcon, XaiLogo, XIcon} from "@sentry/ui/src/rebrand/icons/IconsComponents";
import Burger from "@/features/header/Burger";
import MobileNavbar from "@/features/header/MobileNavbar";
import {useState} from "react";

export function Header() {
	const {open} = useWeb3Modal();
	const {address} = useAccount()
	const [isNavbarOpened, setIsNavbarOpened] = useState(false)
	return (
		<div className="w-full">
			<div className="fixed top-0 flex w-full justify-between items-center bg-transparent z-[10]">
				<a
					className="w-full group md:max-w-[108px] md:min-h-[108px] min-h-[64px] max-w-[64px] flex items-center bg-hornetSting justify-center hover:bg-white duration-200 ease-in cursor-pointer"
					href="https://xai.games/"
				>
					<XaiLogo className="md:w-[43px] md:h-[38px] w-[26px] h-[23px] fill-white group-hover:fill-hornetSting duration-200 ease-in" />
				</a>
				<div className="font-bold text-xl items-center gap-[20px] uppercase text-white hidden md:flex">
					<ExternalLink
						content={"DOCS"}
						externalTab
						link={"https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup"}
						customClass={"no-underline !font-bold text-xl hover:text-hornetSting"}/>
					<span className="block uppercase text-foggyLondon">|</span>

					<div className="flex gap-[16px]">
						<ExternalLink
							content={
								<TelegramIcon className={"hover:fill-hornetSting fill-white duration-200 ease-in"} />
							}
							link={"https://t.me/XaiSentryNodes"}
							externalTab
							customClass={"no-underline !font-bold text-xl "}
						/>

						<ExternalLink
							content={
								<DiscordIcon className={"hover:fill-hornetSting fill-white duration-200 ease-in"} />
							}
							externalTab
							link={"https://discord.com/invite/xaigames"}
							customClass={"no-underline !font-bold text-xl "}
						/>

						<ExternalLink
							content={
								<XIcon className={"hover:fill-hornetSting fill-white duration-200 ease-in"} />
							}
							link={"https://twitter.com/xai_games"}
							externalTab
							customClass={"no-underline !font-bold text-xl "}
						/>

					</div>

					<ConnectButton onOpen={open} address={address}/>
				</div>
				{/* Burger menu for mobile */}
				<Burger openNavbar={() => setIsNavbarOpened(true)} />
				<MobileNavbar isOpened={isNavbarOpened} closeNavbar={() => setIsNavbarOpened(false)} />
			</div>
		</div>
	);
}
