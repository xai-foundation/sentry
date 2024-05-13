"use client"

import { Navbar, NavbarContent, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link } from "@nextui-org/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "../buttons/ButtonsComponent";
import { LinkLogoComponent } from "../links/LinkComponent";
import { Discord, ErrorCircle, GitBook, Telegram, X, Xai } from "../icons/IconsComponent";
import { TESTNET_ID } from "@/services/web3.service";

export default function NavbarComponent() {
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const { open } = useWeb3Modal();
	const { address, chainId } = useAccount();
	const [isTestnet, setIsTestnet] = useState(false);

	useEffect(() => {
		setIsTestnet(chainId == TESTNET_ID);
	}, [chainId])

	return (
		<Navbar isBordered maxWidth="full"
			className={`flex border-b-1 border-silverMist bg-lightWhiteDarkBlack mb-5`}
			isMenuOpen={isMenuOpen}
			onMenuOpenChange={() => setIsMenuOpen(!isMenuOpen)}
		>
			<NavbarContent className="lg:hidden" justify="start">
				<NavbarMenuToggle />
				<div className='flex items-center ml-1'>
					<span className='pb-[6px]'><Xai /></span>
					<Link href={chainId ? `/?chainId=${chainId}` : "/"}><div className='text-lg text-lightBlackDarkWhite font-bold py-2 pl-2'>Xai</div></Link>
				</div>
			</NavbarContent>
			<NavbarContent justify="start" className="hidden lg:block">
			</NavbarContent>
			<NavbarContent className="" justify="end">
				{isTestnet && <><span className="text-[#ED5F00] text-sm md:text-lg ml-0 flex items-center gap-1"><ErrorCircle />TESTNET</span></>}<ConnectButton onOpen={open} address={address} />
			</NavbarContent>
			<NavbarMenu className="flex flex-col justify-between bg-lightWhiteDarkBlack h-full">
				<NavbarMenuItem>
					<div className="">
						<div className='flex flex-col'>
							<Link href={chainId ? `/?chainId=${chainId}` : "/"} onClick={() => setIsMenuOpen(false)}>
								<div className="text-base text-lightBlackDarkWhite py-2 pl-4">Dashboard</div>
							</Link>
							<Link href={`/staking?chainId=${chainId}`} onClick={() => setIsMenuOpen(false)}><div className='text-base text-lightBlackDarkWhite py-2 pl-4'>Staking</div></Link>
							<Link href="/redeem" onClick={() => setIsMenuOpen(false)}><div className='text-base text-lightBlackDarkWhite py-2 pl-4'>Redeem</div></Link>
							<Link href="/pool" onClick={() => setIsMenuOpen(false)}><div className='text-base text-lightBlackDarkWhite py-2 pl-4'>My Pools</div></Link>
						</div>
					</div>
				</NavbarMenuItem>
				<NavbarMenuItem>
					<div className="flex flex-col mb-5">
						<LinkLogoComponent link="https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai"
							content="GitBook" Icon={GitBook} customClass="mb-[10px]" />
						<LinkLogoComponent link="https://discord.com/invite/xaigames" content="Discord" Icon={Discord}
							customClass="mb-[10px]" />
						<LinkLogoComponent link="https://twitter.com/xai_games" content="X" Icon={X} customClass="mb-[10px]" />
						<LinkLogoComponent link="https://t.me/XaiSentryNodes" content="Telegram" Icon={Telegram}
							customClass="mb-[10px]" />
						<Link href="https://xai.games/generalterms" target="_blank" onClick={() => setIsMenuOpen(false)}><div className='text-sm text-lightBlackDarkWhite py-2 pl-4'>General Terms</div></Link>
						<Link href="https://xai.games/stakingterms" target="_blank" onClick={() => setIsMenuOpen(false)}><div className='text-sm text-lightBlackDarkWhite py-2 pl-4'>Staking Terms</div></Link>
						<Link href="https://xai.games/privacypolicy" target="_blank" onClick={() => setIsMenuOpen(false)}><div className='text-sm text-lightBlackDarkWhite py-2 pl-4'>Privacy Policy</div></Link>
					</div>
				</NavbarMenuItem>
			</NavbarMenu>
		</Navbar>
	)
}