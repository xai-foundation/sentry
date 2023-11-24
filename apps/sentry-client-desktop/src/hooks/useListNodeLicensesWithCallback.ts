import {useEffect, useState} from "react";
import {listNodeLicenses} from "@sentry/core";
import {atom, useAtom} from "jotai";

export type LicenseMap = Record<string, bigint[]>;
export type LicenseList = Array<{ owner: string, key: bigint }>;

export const licensesAtom = atom<LicenseMap>({});

export function useListNodeLicensesWithCallback(wallets: string[] = [], refresh = 0) {
	const [loading, setLoading] = useState(false);
	const [licenses, setLicenses] = useAtom(licensesAtom);


	useEffect(() => {
		setLicenses({})
	}, [refresh]);

	useEffect(() => {
		if (wallets.length > 0) {
			void getNodeLicenses();
		}
	}, [JSON.stringify(wallets), refresh]);

	async function getNodeLicenses() {
		setLoading(true);

		await Promise.all(wallets.map(async (wallet) => {
			try {
				await listNodeLicenses(wallet, (tokenId) => foundLicenseCallback(wallet, tokenId));
			} catch (e) {
				throw Error("Unable to retrieve list of node licenses. You are likely rate limited.");
			}
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

export function getLicensesList(_licenses: LicenseMap): LicenseList {
	const keysWithOwners: LicenseList = [];
	Object.keys(_licenses).map((owner) => {
		_licenses[owner]?.forEach((license) => {
			keysWithOwners.push({owner, key: license});
		});
	});

	return keysWithOwners;
}
