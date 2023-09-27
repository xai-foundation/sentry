import {RootRoute, Route, Router} from "@tanstack/react-router";
import {Root} from ".";
import {ConnectWallet} from "../ConnectWallet.tsx";
import {Home} from "../home/Home.tsx";
import {Licenses} from "../licenses/Licenses.tsx";

// Create a root route
export const rootRoute = new RootRoute({
	component: Root,
});

export const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: ConnectWallet,
});

export const homeRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/home",
	component: Home,
});

export const licensesRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/licenses",
	component: Licenses,
});

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([
	indexRoute,
	homeRoute,
	licensesRoute
]); // Include the homeRoute in the route tree

// Create the router using your route tree
export const router = new Router({routeTree});
