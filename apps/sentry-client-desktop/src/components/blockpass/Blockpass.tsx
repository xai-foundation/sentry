import {useEffect} from "react";

export function Blockpass() {
	useEffect(() => {
		// Check if BlockpassKYCConnect is defined on the window object
		if ((window as any).BlockpassKYCConnect) {
			const blockpass = new (window as any).BlockpassKYCConnect("xai_node_007da", {
				// refId: 'refId', // Replace with your refId value
				mainColor: "F30919",
			});

			blockpass.startKYCConnect();

			blockpass.on('KYCConnectSuccess', () => {
				// Add code that will trigger when data has been sent.
			});
		}
	}, []);

	return (
		<button
			className="w-auto h-auto bg-[#F30919] text-white p-4 uppercase font-semibold"
			id="blockpass-kyc-connect"
		>
			Verify with Blockpass
		</button>
	);
}

export function BlockPassKYC() {
	useEffect(() => {
		// Check if BlockpassKYCConnect is defined on the window object
		if ((window as any).BlockpassKYCConnect) {
			const blockpass = new (window as any).BlockpassKYCConnect("xai_node_007da", {
				// refId: 'refId', // Replace with your refId value
				mainColor: "F30919",
			});

			blockpass.startKYCConnect();

			blockpass.on('KYCConnectSuccess', () => {
				// Add code that will trigger when data has been sent.
			});
		}
	}, []);

	return (
		<a id="blockpass-kyc-connect" className="text-[#F30919] cursor-pointer">
			Begin KYC
		</a>
	);

}
