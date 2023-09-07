import { RootRoute, Route, Router } from "@tanstack/react-router"
import { Root } from "."

// Create a root route
export const rootRoute = new RootRoute({
    component: Root,
})

export const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>yo</h1>,
})

// Create the route tree using your routes
const routeTree = rootRoute.addChildren([
    indexRoute
])

// Create the router using your route tree
export const router = new Router({ routeTree })