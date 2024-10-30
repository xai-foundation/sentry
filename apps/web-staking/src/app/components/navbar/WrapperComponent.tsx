"use client";

import { useTheme } from "next-themes";
import NavbarComponent from "./NavbarComponent";
import SidebarComponent from "./SidebarComponent";
import { useEffect } from "react";
import AnnouncementBanner from "@/app/components/AnnouncementBanner";

export default function WrapperComponent({ children }: { children: React.ReactNode }) {

	const { setTheme } = useTheme();

	useEffect(() => {
		setTheme("light");
	}, [setTheme]);

	return (
		<>
			<AnnouncementBanner
				activateBanner={false}
				bannerVersion="tk"
				title={"Announcement title."}
				text={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc non porttitor urna."}
				href={"https://xai-foundation.gitbook.io/xai-network"}
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
