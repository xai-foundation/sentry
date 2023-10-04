import {Outlet} from "@tanstack/react-router";
import Sidebar from "../sidebar/SidebarRoot";

/**
 * Root component that renders the Sidebar and the Outlet.
 * The Sidebar fills the entire left side of the page,
 * and the Outlet fills the remainder of the right side of the screen.
 */
export function Root() {
	return (
		<div className="flex">
			<div className="w-64 h-screen">
				<Sidebar/>
			</div>
			<div className="flex-grow">
				<Outlet/>
			</div>
		</div>
	)
}
