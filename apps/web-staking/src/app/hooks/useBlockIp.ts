"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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

export function useBlockIp() {
	const [blocked, setBlocked] = useState(true);
	const [loading, setLoading] = useState(true);

	const pathname = usePathname();

	useEffect(() => {

		async function checkIp() {
			try {
				const { data } = await axios.post(`https://centralized-services.expopulus.com/check-ip`);
				const invalidIp = data.reasons?.find(({ type }: checkIpProps) => type === "INVALID_IP");
				const ofacSanction = data.reasons?.find(({ type, geoBanType }: checkIpProps) => type === "GEO" && geoBanType === "OFAC_SANCTIONS");

				if (!invalidIp || !ofacSanction) {
					setBlocked(false);
					setLoading(false);
				}

				if (!!invalidIp || !!ofacSanction || (process.env.NEXT_PUBLIC_APP_ENV !== "development" && data.country === "US")) {
					setBlocked(true);
					setLoading(false);
				}
			} catch (e: any) {
				console.error(e.response.data);
			}
		}

		void checkIp();
	}, [pathname]);

	return {
		blocked,
		loading,
	};
}
