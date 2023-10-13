import { useState, useEffect } from "react";
import {Blockpass} from "../../components/blockpass/Blockpass.tsx";
import {useOperator} from "../operator/useOperator";
import {useStorage} from "../storage/useStorage";

export function Home() {
	const {loading, privateKey, error} = useOperator();
	const {data, setData, getFilePath} = useStorage();
	const [inputValue, setInputValue] = useState('');
	const [filePath, setFilePath] = useState('');

	useEffect(() => {
		const fetchFilePath = async () => {
			const path = await getFilePath();
			setFilePath(path);
		};
		fetchFilePath();
	}, [getFilePath]);

	const handleInputChange = (event: any) => {
		setInputValue(event.target.value);
	};

	const handleSetData = () => {
		setData({...data, arbitraryField: inputValue});
	};

	return (
		<div className="w-full h-screen flex justify-center items-center">
			<div className="absolute flex flex-col gap-4 right-0 top-0 p-4">
				<h1>Home</h1>
				<p className="text-gray-700">File Path: {filePath}</p>
				
				{loading ? <p className="text-gray-500">Loading...</p> : null}
				<p className="text-gray-700">Private Key: {privateKey ? privateKey : 'N/A'}</p>
				{error ? <p className="text-red-500">Error: {error.message}</p> : null}
				{error ? <pre className="text-red-500">{error.stack}</pre> : null}
				<input type="text" value={inputValue} onChange={handleInputChange} className="mt-2 p-2 border rounded" placeholder="Enter arbitrary data" />
				<button onClick={handleSetData} className="mt-2 p-2 bg-blue-500 text-white rounded">Set Data</button>
			</div>

			<Blockpass/>
		</div>
	)
}
