import {useEffect, useState} from "react";
import {checkKycStatus} from "@sentry/core";

export type StatusMap = Record<string, boolean>;

export function useKycStatusesWithCallback(wallets: string[] = [], refresh = 0) {
	const [loading, setLoading] = useState(false);
	const [statuses, setStatuses] = useState<StatusMap>({});

	useEffect(() => {
		setStatuses({});
	}, [refresh]);

	useEffect(() => {
		if (wallets.length > 0) {
			void getStatuses();
		}
	}, [JSON.stringify(wallets), refresh]);

	async function getStatuses() {
		setLoading(true);

		await checkKycStatus(wallets, (wallet, isKycApproved) => {
			setStatuses((_statuses) => {
				_statuses[wallet] = isKycApproved;
				return _statuses
			});
		});

		setLoading(false);
	}

	return {
		isLoading: loading,
		statusMap: statuses,
	}
}
