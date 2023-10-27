import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from "react-query";
import {Checkout} from "../checkout";
import {ConnectWallet} from "../wallet/ConnectWallet.tsx";
import {AssignWallet} from "../wallet/AssignWallet.tsx";

export function AppRoutes() {
	const queryClient = new QueryClient();

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<Routes>
					<Route path="/" element={<Checkout/>}/>
					<Route path="/connect-wallet" element={<ConnectWallet/>}/>
					<Route path="/assign-wallet" element={<AssignWallet/>}/>
				</Routes>
			</QueryClientProvider>
		</BrowserRouter>
	);
}
