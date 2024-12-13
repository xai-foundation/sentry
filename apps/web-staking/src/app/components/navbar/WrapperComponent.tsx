"use client";

import { useTheme } from "next-themes";
import NavbarComponent from "./NavbarComponent";
import SidebarComponent from "./SidebarComponent";
import { useEffect } from "react";
import AnnouncementBanner from "@/app/components/AnnouncementBanner";
import { ThreeStars } from "../icons/IconsComponent";

export default function WrapperComponent({ children }: { children: React.ReactNode }) {

	const { setTheme } = useTheme();

	useEffect(() => {
		setTheme("light");
	}, [setTheme]);

	return (
		<>
			<AnnouncementBanner
				icon={<ThreeStars/>}
				activateBanner={true}
				bannerVersion="tk"
				title={"Sentry Keys have completed a 1:100 split to make them more accessible."}
				text={""}
				href={"https://medium.com/@xaifoundation/your-key-to-the-crypto-industry-your-key-to-the-game-industry-your-key-to-success-your-key-to-d9ca387884c1"}
				href2={"https://malleable-watchmaker-e7f.notion.site/Welcome-Sentry-Key-Ambassador-14f94bd8393a80ef86e1d5ac1eef70ce"}
			/>
			<div className="flex">
				<div className="hidden lg:block">
					<SidebarComponent />
				</div>
				<div className="w-full min-h-screen h-full">
					<NavbarComponent />
					{children}
				</div>
			</div>
		</>
	);
};
