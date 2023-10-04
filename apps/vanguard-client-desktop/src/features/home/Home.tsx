import {Dispatch, SetStateAction} from "react";

interface HomeProps {
	connected: boolean
	setConnected: Dispatch<SetStateAction<boolean>>
}

export function Home({connected, setConnected}: HomeProps) {
	return (
		<div className="w-full h-screen flex justify-center items-center">

			{/*		todo: for dev purposes only, delete once persisting storage is implemented		*/}
			<div className="absolute right-0 top-0 p-4">
				<button
					onClick={() => setConnected(!connected)}
				>
					Go to Connect Wallet
				</button>
			</div>

			<h1>Home</h1>
		</div>
	)
}
