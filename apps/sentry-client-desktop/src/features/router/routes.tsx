import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "../sidebar";
import {GetSentryNode} from "../home/GetSentryNode.js";
import {Keys} from "../keys/Keys.js";
import {SentryWallet} from "../home/SentryWallet.js";
import {Redeem} from "@/features/redeem/Redeem";
import {Demo} from "../demo/Demo.js";
import {DrawerManager} from "../drawer/DrawerManager";
import {ModalManager} from "@/features/modal/ModalManager";
import {QueryClient, QueryClientProvider} from "react-query";
import {BlockpassHandler} from "@/components/blockpass/BlockpassHandler";

export function AppRoutes() {
	const queryClient = new QueryClient();

	return (
		<Router>
			<QueryClientProvider client={queryClient}>
				<div className="w-full h-screen flex">
					<BlockpassHandler/>
					<Sidebar/>

					<div className="max-w-[1686px] flex-grow">
						<Routes>
							<Route path="/" element={<GetSentryNode/>}/>

							<Route path="/keys" element={<Keys/>}/>
							<Route path="/sentry-wallet" element={<SentryWallet/>}/>
							<Route path="/redeem" element={<Redeem/>}/>

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
