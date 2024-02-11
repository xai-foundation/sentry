import {Challenge, NodeLicenseInformation, NodeLicenseStatusMap, operatorRuntime, PublicNodeBucketInformation} from "@sentry/core";
import {useOperator} from "@/features/operator";
import {atom, useAtom} from "jotai";
import {useEffect, useState} from "react";
import {useStorage} from "@/features/storage";
import log from "electron-log";

function onAssertionMissMatch(publicNodeData: PublicNodeBucketInformation, challenge: Challenge, message: string) {
	const errorMessage = `The comparison between public node and challenge failed:\n` +
		`${message}\n\n` +
		`Public node data:\n` +
		`${JSON.stringify(publicNodeData, null, 2)}\n\n` +
		`Challenge data:\n` +
		`${JSON.stringify(challenge, null, 2)}\n`;

	log.error(errorMessage);
	alert(errorMessage);
}

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

	function writeLog(message: string) {
		if (message.startsWith("Error")) {
			log.error(message);
		} else {
			log.info(message);
		}
		const _logs = runtimeLogs.concat([]);
		if (_logs.length === 1000) {
			_logs.shift();
		}

		_logs.push(message);
		setRuntimeLogs(_logs);
	}

	async function startRuntime() {
		if (!sentryRunning && stop === undefined) {
			setSentryRunning(true);
			await setData({...data, sentryRunning: true});

			// @ts-ignore
			stop = await operatorRuntime(signer, setNodeLicenseStatusMap, writeLog, whitelistedWallets, onAssertionMissMatch);
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
