import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import {Sidebar} from "../sidebar";
import {GetSentryNode} from "../home/GetSentryNode.js";
import {Keys} from "../keys/Keys.js";
import {SentryWallet} from "../home/SentryWallet.js";
import {DrawerManager} from "../drawer/DrawerManager";
import {ModalManager} from "@/features/modal/ModalManager";
import {QueryClient, QueryClientProvider} from "react-query";
import {BlockpassHandler} from "@/components/blockpass/BlockpassHandler";
import {ChainDataManager} from "@/components/ChainDataManager";
import {createStore, Provider as JotaiProvider} from "jotai";
import {AccruingDataManager} from "@/components/AccruingDataManager";
import toast, {Toaster} from "react-hot-toast";
import * as Sentry from "@sentry/react";

const store = createStore();

export function AppRoutes() {
	const queryClient = new QueryClient();

	Sentry.init({
		dsn: "https://a72bd57d284f8711761b36655e40b65e@o4506378569777152.ingest.sentry.io/4506378571612160",
		integrations: [
			new Sentry.BrowserTracing({
				// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
				tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
			}),
			new Sentry.Replay(),
		],
		// Performance Monitoring
		tracesSampleRate: 1.0, //  Capture 100% of the transactions
		// Session Replay
		replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
		replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	});

	window.ipcRenderer.on("update-available", () => {
		if (window.electron.platform === "win32") {
			toast.loading("Downloading update. Your app will restart soon.")
		} else {
			toast.success("Update is available for download at xai.games/sentrynodes", {duration: 10000});
		}
	});

	window.ipcRenderer.on("update-error", () => {
		if (window.electron.platform === "win32") {
			toast.remove();
			toast.error("Error downloading update. Retrying in 5 minutes.");
		}
	});

	return (
		<JotaiProvider store={store}>
			<Router>
				<QueryClientProvider client={queryClient}>
					<div className="w-full h-screen flex">
						<ChainDataManager/>
						<AccruingDataManager/>
						<BlockpassHandler/>
						<Sidebar/>
						<Toaster position="top-right"/>

						<div className="flex-grow">
							<Routes>
								<Route path="/" element={<GetSentryNode/>}/>
								<Route path="/keys" element={<Keys/>}/>
								<Route path="/sentry-wallet" element={<SentryWallet/>}/>
								{/*<Route path="/redeem" element={<Redeem/>}/>*/}
							</Routes>
						</div>

						<ModalManager/>
						<DrawerManager/>
					</div>
				</QueryClientProvider>
			</Router>
		</JotaiProvider>
	);
}
