import {HashRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from "react-query";
import {Checkout} from "../checkout";
import {ConnectWallet} from "../wallet/routes/ConnectWallet.js";
import {AssignWallet} from "../wallet/routes/AssignWallet.js";
import {UnassignWallet} from "@/features/wallet/routes/UnassignWallet";
import {Header} from "@/features/header/Header";
import {useEffect, useState} from "react";
import axios from "axios";
import {BiLoaderAlt} from "react-icons/bi";
import {Footer} from "@/features/footer/Footer";

enum IpBanType {
	INVALID_IP = "INVALID_IP",
	GEO = "GEO",
}

enum GeoBanType {
	OFAC_SANCTIONS = "OFAC_SANCTIONS",
	GAMBLING = "GAMBLING",
	SECURITIES = "SECURITIES",
}

interface checkIpProps {
	type: IpBanType;
	geoBanType: GeoBanType;
}

export function AppRoutes() {
	const queryClient = new QueryClient();
	const [blocked, setBlocked] = useState(true)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		void checkIp();
	}, [location.pathname]);

	async function checkIp() {
		try {
			const {data} = await axios.post(`https://centralized-services.expopulus.com/check-ip`);
			const invalidIp = data.reasons?.find(({type}: checkIpProps) => type === "INVALID_IP");
			const ofacSanction = data.reasons?.find(({type, geoBanType}: checkIpProps) => type === "GEO" && geoBanType === "OFAC_SANCTIONS");

			if (!invalidIp || !ofacSanction) {
				setBlocked(false);
				setLoading(false);
			}

			if (!!invalidIp || !!ofacSanction) {
				setBlocked(true);
				setLoading(false);
			}
		} catch (e: any) {
			console.error(e.response.data);
		}
	}

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
			</div>
		)
	}

	if (!loading && blocked) {
		return (
			<pre className="p-2 text-[14px]">Not Found</pre>
		)
	}

	if (!loading && !blocked) {
		return (
			<Router basename={"/"}>
				<QueryClientProvider client={queryClient}>
					<Header/>
					<Routes>
						<Route path="/" element={<Checkout/>}/>
						<Route path="/connect-wallet" element={<ConnectWallet/>}/>
						<Route path="/assign-wallet/:operatorAddress" element={<AssignWallet/>}/>
						<Route path="/unassign-wallet/:operatorAddress" element={<UnassignWallet/>}/>
						<Route path="*" element={<Navigate to="/" replace={true}/>}/>
					</Routes>
					<Footer/>
				</QueryClientProvider>
			</Router>
		);
	}
}
