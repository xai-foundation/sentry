import {Blockpass} from "../../components/blockpass/Blockpass.tsx";

export function Home() {
	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div className="absolute flex flex-col gap-4 right-0 top-0 p-4">
				<h1>Home</h1>
			</div>

			<Blockpass/>
		</div>
	)
}
