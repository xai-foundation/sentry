import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "../sidebar";
import {GetSentryNode} from "../home/GetSentryNode.tsx";
import {Keys} from "../keys/Keys.tsx";
import {Operator} from "../operator/Operator.tsx";
import {SentryWallet} from "../home/SentryWallet.tsx";
import {Demo} from "../demo/Demo.tsx";
import {DrawerManager} from "../drawer/DrawerManager";
import {QueryClient, QueryClientProvider} from "react-query";
import {DeepLinkManager} from "../../components/DeepLinkManager";

export function AppRoutes() {
	const queryClient = new QueryClient();

	return (
		<Router>
			<QueryClientProvider client={queryClient}>
				<div className="w-full h-screen flex">
					<DeepLinkManager/>
					<Sidebar/>

					<div className="max-w-[1686px] flex-grow">
						<Routes>
							<Route path="/" element={<GetSentryNode/>}/>

							<Route path="/keys" element={<Keys/>}/>
							<Route path="/sentry-wallet" element={<SentryWallet/>}/>

							<Route path="/operator" element={<Operator/>}/>
							<Route path="/demo" element={<Demo/>}/>
						</Routes>
					</div>

					<DrawerManager/>
				</div>
			</QueryClientProvider>
		</Router>
	);
}
