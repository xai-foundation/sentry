"use client";

import { PropsWithChildren } from "react";
import { useBlockIp } from "./hooks/useBlockIp";
import { BiLoaderAlt } from "react-icons/bi";

export function IpLocationChecker({ children }: PropsWithChildren) {

	const { blocked, loading } = useBlockIp();

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"} />
			</div>
		)
	}

	if (blocked) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<h3 className="md:text-3xl text-2xl text-white font-bold text-center">You are unable to access this website.</h3>
			</div>
		);
	}

	return children;
}
