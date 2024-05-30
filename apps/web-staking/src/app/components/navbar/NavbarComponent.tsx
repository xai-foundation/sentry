"use client"

import { Navbar, NavbarContent, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link } from "@nextui-org/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { IoMdClose } from "react-icons/io";

import { LinkLogoComponent } from "../links/LinkComponent";
import { Burger, Discord, ErrorCircle, GitBook, Telegram, X, XaiIcon } from "../icons/IconsComponent";
import { TESTNET_ID } from "@/services/web3.service";
import { ConnectButton } from "../ui/buttons";
import { usePathname } from "next/navigation";

export default function NavbarComponent() {
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const { open } = useWeb3Modal();
	const { address, chainId } = useAccount();
	const [isTestnet, setIsTestnet] = useState(false);
	const url = usePathname();

	useEffect(() => {
		setIsTestnet(chainId == TESTNET_ID);
	}, [chainId])

	const getActiveLink = (link: string) => {
      return url === link.split("?")[0]
      ? "bg-white !text-hornetSting global-clip-path"
      : "";
	}

	return (
		<Navbar isBordered isBlurred={false} maxWidth="full"
						className={`flex bg-transparent mb-5 border-0 sticky`}
			isMenuOpen={isMenuOpen}
			onMenuOpenChange={() => setIsMenuOpen(!isMenuOpen)}
			classNames={{
            wrapper: "pl-0 pr-3",
          }}
		>
			<NavbarContent justify="start" className="hidden lg:block">
			</NavbarContent>
			<NavbarContent className={`${isMenuOpen ? "hidden" : "block"}`}>
				<Link
					className="group lg:hidden flex items-center justify-center w-[64px] h-[64px] bg-hornetSting hover:bg-white duration-200 ease-in"
					href={chainId ? `/?chainId=${chainId}` : "/"}>
					<XaiIcon width={29.5} height={29.5} />
                </Link>
			</NavbarContent>
			<div
				className={`${isMenuOpen ? "hidden" : "block"} lg:mt-[40px] mt-[0] flex justify-end w-full h-[58px] items-center`}>
				<ConnectButton
					onOpen={open}
					address={address}
					size="md"
					extraClasses="lg:max-h-[54px] max-h-[40px] h-full lg:px-[20px] px-[14px] lg:py-[16px] py-[9px]"
				/>
				{isTestnet && <>
					<span
						className="absolute lg:right-[200px] lg:top-[30px] md:top-[15px] md:right-[250px] top-[20px] left-[80px] text-[#ED5F00] text-sm md:text-lg ml-0 flex items-center justify-end ">
				<ErrorCircle width={12}
										 height={12}
				/>
				TESTNET
				</span>
				</>
				}
			</div>
			<NavbarContent className="lg:hidden" justify="end">
				<NavbarMenuToggle className="text-white text-lg w-[64px] items-center h-full"
													icon={isMenuOpen ? <IoMdClose color="white" size={34} className="z-[40]" /> :
														<div className="bg-hornetSting h-[64px] w-[64px] flex items-center justify-center">
															<Burger />
														</div>} />
			</NavbarContent>
			<NavbarMenu
				className="lg:hidden flex fixed z-[40] top-0 left-0 flex-col justify-between bg-tourchRed min-h-screen pt-[70px]">
				<NavbarMenuItem>
					<div className="">
						<div className='flex flex-col'>
							<Link
								href={chainId ? `/?chainId=${chainId}` : "/"}
								onClick={() => {
									sessionStorage.setItem("activePage", "/");
									setIsMenuOpen(false);
								}}
							>
								<div className={`w-full text-2xl text-white p-4 font-bold hover:text-tourchRed hover:bg-white hover:global-clip-path ${getActiveLink("/")}`}>DASHBOARD</div>
							</Link>
							<Link
								href={`/staking?chainId=${chainId}`}
								onClick={() => {
									sessionStorage.setItem("activePage", "/staking");
									setIsMenuOpen(false);
								}}
							>
								<div
									className={`w-full text-2xl text-white p-4 font-bold hover:text-tourchRed hover:bg-white hover:global-clip-path ${getActiveLink("/staking")}`}>STAKING
								</div>
							</Link>
							<Link
								href="/redeem"
								onClick={() => {
									sessionStorage.setItem("activePage", "/redeem");
									setIsMenuOpen(false);
								}}
							>
								<div
									className={`w-full text-2xl text-white p-4 font-bold hover:text-tourchRed hover:bg-white hover:global-clip-path ${getActiveLink("/redeem")}`}>REDEEM
								</div>
							</Link>
							<Link
								href="/pool"
								onClick={() => {
									sessionStorage.setItem("activePage", "/pool");
									setIsMenuOpen(false);
								}}
							>
								<div
									className={`w-full text-2xl text-white p-4 font-bold hover:text-tourchRed hover:bg-white hover:global-clip-path ${getActiveLink("/pool")}`}>MY
									POOLS
								</div>
							</Link>
						</div>
					</div>
				</NavbarMenuItem>
				<NavbarMenuItem>
					<div className="flex flex-col mb-5">
						<LinkLogoComponent link="https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai"
							content="GITBOOK" Icon={GitBook} customClass="mb-[10px]" />
						<LinkLogoComponent link="https://discord.com/invite/xaigames" content="DISCORD" Icon={Discord}
							customClass="mb-[10px]" />
						<LinkLogoComponent link="https://twitter.com/xai_games" content="X" Icon={X} customClass="mb-[10px]" />
						<LinkLogoComponent link="https://t.me/XaiSentryNodes" content="TELEGRAM" Icon={Telegram}
							customClass="mb-[25px]" />
						<Link href="https://xai.games/generalterms" target="_blank" onClick={() => setIsMenuOpen(false)}><div className='text-base text-white py-1 pl-4'>TERMS OF SERVICE</div></Link>
						<Link href="https://xai.games/stakingterms" target="_blank" onClick={() => setIsMenuOpen(false)}><div className='text-base text-white py-1 pl-4'>STAKING TERMS</div></Link>
						<Link href="https://xai.games/privacy-policy/" target="_blank" onClick={() => setIsMenuOpen(false)}>
							<div className="text-base text-white py-1 pl-4">PRIVACY POLICY</div>
						</Link>
					</div>
				    <div className="mt-[25px] mb-[25px] px-4 text-white font-light text-lg uppercase">
                        <p>&copy;2024 XAI</p>
                    </div>
				</NavbarMenuItem>
			</NavbarMenu>

		</Navbar>
	)
}