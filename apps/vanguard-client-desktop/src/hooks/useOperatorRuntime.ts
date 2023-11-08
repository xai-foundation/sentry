import {NodeLicenseInformation, NodeLicenseStatusMap, operatorRuntime} from "@xai-vanguard-node/core";
import {useOperator} from "@/features/operator";
import {atom, useAtom} from "jotai";

let stop: (() => Promise<void>) | undefined;
export const sentryRunningAtom = atom(stop != null);
export const nodeLicenseStatusMapAtom = atom<NodeLicenseStatusMap>(new Map<bigint, NodeLicenseInformation>());
export const runtimeLogsAtom = atom<string[]>([]);

export function useOperatorRuntime() {
	const {signer} = useOperator();
	const [sentryRunning, setSentryRunning] = useAtom(sentryRunningAtom);
	const [nodeLicenseStatusMap, setNodeLicenseStatusMap] = useAtom(nodeLicenseStatusMapAtom);
	const [runtimeLogs, setRuntimeLogs] = useAtom(runtimeLogsAtom);

	function writeLog(log: string) {
		const _logs = runtimeLogs.concat([]);
		if (_logs.length === 1000) {
			_logs.shift();
		}

		_logs.push(log);
		setRuntimeLogs(_logs);
	}

	async function startRuntime() {
		if (signer && !sentryRunning && stop === undefined) {
			setSentryRunning(true);

			// @ts-ignore
			stop = await operatorRuntime(signer, setNodeLicenseStatusMap, writeLog);
		}
	}

	async function stopRuntime() {
		if (sentryRunning && stop !== undefined) {
			// prevent race conditions from pressing "stop" too fast
			const _stop = stop;
			stop = undefined;

			await _stop();
			setNodeLicenseStatusMap(new Map<bigint, NodeLicenseInformation>());
			setSentryRunning(false);
		}
	}

	return {
		startRuntime: signer && startRuntime,
		stopRuntime: stop && stopRuntime,
		sentryRunning,
		nodeLicenseStatusMap,
	}
}
