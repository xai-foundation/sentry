"use client";

import { useBlockIp } from "@/hooks/useBlockIp";
import { PropsWithChildren } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import {IP_BLOCK_TEXT} from "@sentry/core";

export function IpLocationChecker({ children }: PropsWithChildren) {

    const blockUsa = true;

	const { blocked, loading } = useBlockIp({blockUsa});

	if (loading) {
		return (
			<div className="w-full h-screen flex justify-center items-center">
				<BiLoaderAlt className="animate-spin" size={32} color={"#000000"} />
			</div>
		)
	}

	if (blocked) {
		return (
			<div className='w-full h-screen flex justify-center items-center'>
				<p className="p-2 text-md text-white">{IP_BLOCK_TEXT}</p>
			</div>
		);
	}

	return children;
}
