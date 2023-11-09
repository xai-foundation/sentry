import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from "react-query";
import {Checkout} from "../checkout";
import {ConnectWallet} from "../wallet/routes/ConnectWallet.js";
import {AssignWallet} from "../wallet/routes/AssignWallet.js";
import {UnassignWallet} from "@/features/wallet/routes/UnassignWallet";

export function AppRoutes() {
	const queryClient = new QueryClient();

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<Routes>
					<Route path="/" element={<Checkout/>}/>
					<Route path="/connect-wallet" element={<ConnectWallet/>}/>
					<Route path="/assign-wallet/:operatorAddress" element={<AssignWallet/>}/>
					<Route path="/unassign-wallet/:operatorAddress" element={<UnassignWallet/>}/>
					<Route path="*" element={<Navigate to="/" replace={true}/>}/>
				</Routes>
			</QueryClientProvider>
		</BrowserRouter>
	);
}
