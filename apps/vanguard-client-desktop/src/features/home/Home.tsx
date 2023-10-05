import {Dispatch, SetStateAction, useEffect} from "react";
import {useAccount} from "wagmi";
import {Blockpass} from "../../components/blockpass/Blockpass.tsx";

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

			{/*		todo: temp placement to allow for users to disconnect wallet		*/}
			<div className="absolute flex flex-col gap-4 right-0 top-0 p-4">
				<h1>Home</h1>
			</div>

			<Blockpass/>
		</div>
	)
}
