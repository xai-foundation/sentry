import {useState} from "react";
import {Home} from "./Home.tsx";
import {GetSentryNode} from "./v2/GetSentryNode.tsx";

export function Homepage() {
	const [connected, setConnected] = useState<boolean>(false);

	return (
		<div>
			{connected ? (
				<Home/>
			) : (
				<GetSentryNode setConnected={setConnected}/>
			)}
		</div>
	)
}
