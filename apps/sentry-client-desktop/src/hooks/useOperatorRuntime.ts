import {NodeLicenseInformation, NodeLicenseStatusMap, operatorRuntime} from "@sentry/core";
import {useOperator} from "@/features/operator";
import {atom, useAtom} from "jotai";
import {useEffect, useState} from "react";
import {useStorage} from "@/features/storage";

let stop: (() => Promise<void>) | undefined;
export const sentryRunningAtom = atom(stop != null);
export const nodeLicenseStatusMapAtom = atom<NodeLicenseStatusMap>(new Map<bigint, NodeLicenseInformation>());
export const runtimeLogsAtom = atom<string[]>([]);

export function useOperatorRuntime() {
	const {signer} = useOperator();
	const [sentryRunning, setSentryRunning] = useAtom(sentryRunningAtom);
	const [nodeLicenseStatusMap, setNodeLicenseStatusMap] = useAtom(nodeLicenseStatusMapAtom);
	const [runtimeLogs, setRuntimeLogs] = useAtom(runtimeLogsAtom);
	const [, setRerender] = useState(0);
	const {data, setData} = useStorage();
	const whitelistedWallets = data?.whitelistedWallets;

	// start sentry on launch / restart sentry
	useEffect(() => {
		if (signer) {
			void startRuntime();
		}
	}, [signer]);

	function writeLog(log: string) {
		console.info(log); // for debugging purposes
		const _logs = runtimeLogs.concat([]);
		if (_logs.length === 1000) {
			_logs.shift();
		}

		_logs.push(log);
		setRuntimeLogs(_logs);
	}

	async function startRuntime() {
		if (!sentryRunning && stop === undefined) {
			setSentryRunning(true);
			await setData({...data, sentryRunning: true});

			// @ts-ignore
			stop = await operatorRuntime(signer, setNodeLicenseStatusMap, writeLog, whitelistedWallets);
			setRerender((_number) => _number + 1);
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
			await setData({...data, sentryRunning: false});
		}
	}

	return {
		startRuntime: signer && startRuntime,
		stopRuntime: stop && stopRuntime,
		sentryRunning,
		nodeLicenseStatusMap,
	}
}
