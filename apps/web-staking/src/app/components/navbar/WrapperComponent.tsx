"use client";

import { useTheme } from "next-themes";
import NavbarComponent from "./NavbarComponent";
import SidebarComponent from "./SidebarComponent";
import { useEffect } from "react";

export default function WrapperComponent({ children }: { children: React.ReactNode }) {

	const { setTheme } = useTheme();

	useEffect(() => {
		setTheme("light");
	}, [setTheme]);

	return (
		<>
			<div className="flex">
				<div className="hidden lg:block">
					<SidebarComponent />
				</div>
				<div className="w-full">
					<NavbarComponent />
					{children}
				</div>
			</div>
		</>
	);
};
