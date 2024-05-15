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
	const [blocked, setBlocked] = useState(true);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		void checkIp();
	}, [location.pathname]);

	async function checkIp() {
		try {
			const {data} = await axios.post(`https://centralized-services.expopulus.com/check-ip`);
			const invalidIp = data.reasons?.find(({type}: checkIpProps) => type === "INVALID_IP");
			const ofacSanction = data.reasons?.find(({type, geoBanType}: checkIpProps) => type === "GEO" && geoBanType === "OFAC_SANCTIONS");

			console.log("GEOBLOCK DEBUG")
			console.log("invalidIp: ", invalidIp)
			console.log("ofacSanction: ", ofacSanction)
			console.log("blockUsa: ", blockUsa)
			console.log("data.country: ", data.country)
			setBlocked(false);
			setLoading(false);

			if (!invalidIp || !ofacSanction) {
				console.log("--------------- WOULD NOT BLOCK --------------------")
			}

			if (!!invalidIp || !!ofacSanction || (blockUsa && data.country === "US")) {
				console.log("--------------- WOULD BLOCK!!! --------------------")
			}
		} catch (e: any) {
			console.error(e.response.data);
		}
	}

	return {
		blocked,
		loading,
	};
}