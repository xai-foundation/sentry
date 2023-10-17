import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "../sidebar";
import {GetSentryNode} from "../home/GetSentryNode.tsx";
import {Keys} from "../keys/Keys.tsx";
import {Operator} from "../operator/Operator.tsx";
import {SentryWallet} from "../home/SentryWallet.tsx";

export function AppRoutes() {
	return (
		<Router>
			<div className="w-full h-screen flex">
				<Sidebar/>

				<div className="max-w-[1686px] flex-grow">
					<Routes>
						<Route path="/" element={<GetSentryNode/>}/>

						<Route path="/keys" element={<Keys/>}/>
						<Route path="/sentry-wallet" element={<SentryWallet/>}/>

						<Route path="/operator" element={<Operator/>}/>
					</Routes>
				</div>
			</div>
		</Router>
	);
}
