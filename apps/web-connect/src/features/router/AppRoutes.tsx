import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Checkout} from "../checkout";
import {QueryClient, QueryClientProvider} from "react-query";

export function AppRoutes() {
	const queryClient = new QueryClient();

	return (
		<Router>
			<QueryClientProvider client={queryClient}>
				<Routes>
					<Route path="/" element={<Checkout/>}/>
				</Routes>
			</QueryClientProvider>
		</Router>
	);
}
