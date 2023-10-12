import {useState} from "react";
import {ConnectWallet} from "./ConnectWallet.tsx";
import {Home} from "./Home.tsx";

export function Homepage() {
	const [connected, setConnected] = useState<boolean>(false);

	return (
		<div className="w-full h-screen">
			{connected ? (
				<Home/>
			) : (
				<ConnectWallet
					setConnected={setConnected}
				/>
			)}
		</div>
	)
}
