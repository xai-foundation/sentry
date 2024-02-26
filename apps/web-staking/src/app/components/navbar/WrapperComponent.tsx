"use client";

import NavbarComponent from "./NavbarComponent";
import SidebarComponent from "./SidebarComponent";

export default function WrapperComponent({ children }: { children: React.ReactNode }) {
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
