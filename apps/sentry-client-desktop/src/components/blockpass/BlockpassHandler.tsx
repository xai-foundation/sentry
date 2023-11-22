import {useEffect} from "react";

export function BlockpassHandler() {
	useEffect(() => {
		if ((window as any).BlockpassKYCConnect) {
			console.log("firing");
			const blockpass = new (window as any).BlockpassKYCConnect("xai_node_007da", {
				mainColor: "F30919",
			});

			blockpass.startKYCConnect();
			blockpass.on('KYCConnectSuccess', () => {
				// Add code that will trigger when data has been sent.
			});
		}
	}, []);

	return <div id={"blockpass-kyc-connect"}/>
}
