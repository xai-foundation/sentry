"use client";

import { useBlockIp } from "@/hooks/useBlockIp";
import IpBlockText from "@sentry/ui/src/rebrand/text/IpBlockText";
import { PropsWithChildren } from "react";
import { BiLoaderAlt } from "react-icons/bi";

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
				<IpBlockText classNames="p-2 text-md text-white" />
			</div>
		);
	}

	return children;
}
