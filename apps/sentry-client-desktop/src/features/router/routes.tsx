import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "../sidebar";
import {GetSentryNode} from "../home/GetSentryNode.js";
import {Keys} from "../keys/Keys.js";
import {Operator} from "../operator/Operator.js";
import {SentryWallet} from "../home/SentryWallet.js";
import {Demo} from "../demo/Demo.js";
import {DrawerManager} from "../drawer/DrawerManager";
import {QueryClient, QueryClientProvider} from "react-query";
import {DeepLinkManager} from "@/components/DeepLinkManager";
import {ModalManager} from "@/features/modal/ModalManager";

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

					<ModalManager/>
					<DrawerManager/>
				</div>
			</QueryClientProvider>
		</Router>
	);
}
