import axios from "axios";
import {useEffect, useState} from "react";

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

export function useBlockIp({blockUsa}: {blockUsa: boolean}) {
	const { VITE_APP_ENV } = import.meta.env
	const [blocked, setBlocked] = useState(true);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		void checkIp();

			async function checkIp() {
				try {
					const {data} = await axios.post(`https://centralized-services.expopulus.com/check-ip`);
					const invalidIp = data.reasons?.find(({type}: checkIpProps) => type === "INVALID_IP");
					const ofacSanction = data.reasons?.find(({type, geoBanType}: checkIpProps) => type === "GEO" && geoBanType === "OFAC_SANCTIONS");
		
					if (!invalidIp || !ofacSanction) {
						setBlocked(false);
						setLoading(false);
					}
		
					if (!!invalidIp || !!ofacSanction || (blockUsa && data.country === "US")) {
						VITE_APP_ENV !== "development" && setBlocked(true);
						setLoading(false);
					}
				} catch (e: any) {
					console.error(e.response.data);
				}
			}
	
	}, [location.pathname, VITE_APP_ENV, blockUsa]);

	return {
		blocked,
		loading,
	};
}