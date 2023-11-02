// import {atom, useAtomValue} from "jotai";
// import {useEffect} from "react";
// import {ipcRenderer} from "electron";

// export const assignedWalletModalAtom = atom<string | null>(null);

export function DeepLinkManager() {
	// const assignedWalletModalState = useAtomValue(assignedWalletModalAtom);
	//
	// useEffect(() => {
	// 	if (assignedWalletModalState !== null) {
	// 		alert("assignedWalletModalState: " + assignedWalletModalState);
	// 	}
	// }, [assignedWalletModalState]);

	(window as any).deeplinks?.assignedWallet((_event, value) => {
		console.log("event:", _event);
		alert("NEW VALUE: " + JSON.stringify(value));
		// const oldValue = Number(counter.innerText)
		// const newValue = oldValue + value
		// counter.innerText = newValue.toString()
	})

	// useEffect(() => {
	// 	listen();
	// }, []);
	//
	// function listen() {
	// 	ipcRenderer.on("test", function (e, data) {
	// 		console.log("e: ", e)
	// 		// console.log("Message received: ", data)
	// 		alert("COMPONENT DATA: " + JSON.stringify(data));
	// 	});
	// }

	return null
}
