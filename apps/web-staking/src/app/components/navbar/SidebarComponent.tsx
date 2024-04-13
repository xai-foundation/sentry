"use client";

import React from 'react';
import Link from 'next/link';

import { LinkComponent, LinkLogoComponent } from '../links/LinkComponent';
import { Discord, GitBook, Telegram, X, Xai } from '../icons/IconsComponent';


export default function SidebarComponent() {
	return (
		<div className="flex flex-col justify-between bg-lightWhiteDarkBlack border-r-1 border-silverMist h-screen w-[245px] sticky top-0">
			{/* Add your sidebar content here */}
			<div className='mx-5'>
				<div className='flex items-center mb-1 px-[20px] py-[10px]'>
					<span className='pb-[6px]'><Xai width={20} height={20} /></span>
					<Link href="/"><div className='text-lg font-bold py-2 pl-2'>Xai</div></Link>
				</div>
				<div className='flex flex-col'>
					<LinkComponent link="/" content='Overview' />
					<LinkComponent link="/staking" content='Staking' />
					<LinkComponent link="/redeem" content='Redeem' />
				</div>
			</div>
			<div>
				<div className='mx-5 mb-12'>
					<LinkLogoComponent link="https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai" content='GitBook' Icon={GitBook} />
					<LinkLogoComponent link="https://discord.com/invite/xaigames" content='Discord' Icon={Discord} />
					<LinkLogoComponent link="https://twitter.com/xai_games" content='X' Icon={X} />
					<LinkLogoComponent link="https://t.me/XaiSentryNodes" content='Telegram' Icon={Telegram} />
				</div>
			</div>
		</div>
	);
};
