import {Dispatch, SetStateAction, useEffect} from "react";
import {Web3Button} from "@web3modal/react";
import {useAccount} from "wagmi";

interface HomeProps {
	setConnected: Dispatch<SetStateAction<boolean>>
}

export function Home({setConnected}: HomeProps) {
	const {isConnected} = useAccount()

	useEffect(() => {
		if (!isConnected) {
			setConnected(false);
		}
	}, [isConnected, setConnected])

	return (
		<div className="w-full h-screen flex justify-center items-center">

			{/*		todo: for dev purposes only, delete once persisting storage is implemented		*/}
			<div className="absolute right-0 top-0 p-4">
				<Web3Button/>
			</div>

			<h1>Home</h1>
		</div>
	)
}
