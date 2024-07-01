import {HashRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from "react-query";
import {Checkout} from "../checkout";
import {AssignWallet} from "../wallet/routes/AssignWallet.js";
import {UnassignWallet} from "@/features/wallet/routes/UnassignWallet";
import {Header} from "@/features/header/Header";
import {Footer} from "@/features/footer/Footer";
import {DropClaim} from "@/features/wallet/routes/DropClaim";
import {useBlockIp} from "@/hooks/useBlockIp";
import {BiLoaderAlt} from "react-icons/bi";
import { ClaimToken } from '../wallet/routes/ClaimToken';
import { TermsAndConditions } from '../wallet/routes/TermsAndConditions';
import {RedEnvelope2024} from "@/features/wallet/routes/RedEnvelope2024";
import {ClaimRedEnvelope2024} from "@/features/wallet/routes/ClaimRedEnvelope2024";
import { ReactCookieConsent } from '../footer/ReactCookieConsent';
import UrlVerification from "@/features/UrlVerification";

export function AppRoutes() {
	const {blocked, loading} = useBlockIp({blockUsa: true});
	const queryClient = new QueryClient();

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
			</div>
		)
	}

	if (blocked) {
		return (
			<div className='w-full h-screen flex justify-center items-center'>
				<p className="p-2 text-md text-white">You are in a country restricted from using this application.</p>
			</div>
		)
	}

	return (
		<Router basename={"/"}>
			<QueryClientProvider client={queryClient}>
				<Header/>
				<UrlVerification />
				<Routes>
					<Route path="/drop-claim" element={<DropClaim/>}/>
					<Route path="/claim-token" element={<ClaimToken/>}/>
					<Route path="/xai-airdrop-terms-and-conditions" element={<TermsAndConditions/>}/>
					<Route path="/assign-wallet/:operatorAddress" element={<AssignWallet/>}/>
					<Route path="/unassign-wallet/:operatorAddress" element={<UnassignWallet/>}/>
					<Route path="/CNY-claim" element={<RedEnvelope2024/>}/>
					<Route path="/CNY-claim-temp" element={<ClaimRedEnvelope2024/>}/>
					<Route path="/" element={<Checkout/>}/>
					<Route path="*" element={<Navigate to="/" replace={true}/>}/>
				</Routes>
				<Footer/>
				<ReactCookieConsent/>
			</QueryClientProvider>
		</Router>
	);
}
