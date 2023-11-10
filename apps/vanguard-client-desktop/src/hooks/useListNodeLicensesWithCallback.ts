import {useEffect, useState} from "react";
import {listNodeLicenses} from "@xai-vanguard-node/core";

export type LicenseMap = Record<string, bigint[]>;
export type LicenseList = Array<{ owner: string, key: bigint }>;

export function useListNodeLicensesWithCallback(wallets: string[] = []) {

	const [loading, setLoading] = useState(false);
	const [licenses, setLicenses] = useState<LicenseMap>({});

	useEffect(() => {
		if (wallets.length > 0) {
			void getNodeLicenses();
		}
	}, [JSON.stringify(wallets)]);

	async function getNodeLicenses() {
		setLoading(true);

		await Promise.all(wallets.map(async (wallet) => {
			await listNodeLicenses(wallet, (tokenId) => foundLicenseCallback(wallet, tokenId));
		}));

		setLoading(false);
	}

	function foundLicenseCallback(wallet, tokenId) {
		setLicenses((_licenses) => {
			const updatedWalletLicenses = _licenses[wallet] ? [..._licenses[wallet]] : [];

			if (updatedWalletLicenses.indexOf(tokenId) < 0) {
				updatedWalletLicenses.push(tokenId);
			}

			return {
				..._licenses,
				[wallet]: updatedWalletLicenses,
			}
		});
	}

	return {
		isLoading: loading,
		licensesMap: licenses,
	}
}

export function getLicensesList(_licenses) {
	const keysWithOwners: Array<{ owner: string, key: bigint }> = [];

	Object.keys(_licenses).map((owner) => {
		_licenses[owner].forEach((license) => {
			keysWithOwners.push({owner, key: license});
		});
	});

	return keysWithOwners;
}
