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
			className="w-64 bg-[#F30919] text-white p-4 uppercase font-semibold mt-2"
			id="blockpass-kyc-connect"
		>
			Verify with Blockpass
		</button>
	);
}
