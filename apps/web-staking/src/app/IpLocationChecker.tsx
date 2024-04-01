"use client";

import {PropsWithChildren} from "react";
import {useBlockIp} from "./hooks/useBlockIp";
import {BiLoaderAlt} from "react-icons/bi";
import { useAccount } from 'wagmi';
import { arbitrum } from '@wagmi/core/chains';

export function IpLocationChecker({children}: PropsWithChildren) {

	const account = useAccount();
	const connectedNetworkId = account?.chain?.id;
	const {blocked, loading} = useBlockIp({blockUsa: connectedNetworkId === arbitrum.id});

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"}/>
			</div>
		)
	}

	if (blocked) {
		return (
			<pre className="p-2 text-sm">You are in a country restricted from using this application.</pre>
		);
	}

	return children;
}
