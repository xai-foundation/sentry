import {Blockpass} from "../../components/blockpass/Blockpass.tsx";
// import {useOperator} from "../operator/useOperator";
// import {useStorage} from "../storage/useStorage";

export function Home() {
	// const {loading, privateKey, error} = useOperator();
	// const {data} = useStorage();

	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div className="absolute flex flex-col gap-4 right-0 top-0 p-4">
				<h1>Home</h1>
				{/* {loading && <p>Loading...</p>}
				{privateKey && <p>Private Key: {privateKey}</p>}
				{error && <p>Error: {error.message}</p>}
				<code>{JSON.stringify(data, null, 2)}</code> */}
			</div>

			<Blockpass/>
		</div>
	)
}
