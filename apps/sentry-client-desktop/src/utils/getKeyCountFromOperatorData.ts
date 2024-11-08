import { BulkOwnerOrPool } from "@sentry/core";

export function getKeyCountFromOperatorData(operatorWalletData: BulkOwnerOrPool[]): number {
	let keyCount = 0;
	operatorWalletData.forEach(o => {
		if (!o.isPool) {
			keyCount += Number(o.keyCount);
			if((o as any).stakedKeyCount){
				keyCount += (Number((o as any).stakedKeyCount))
			}
		}
	});
	return keyCount;
}