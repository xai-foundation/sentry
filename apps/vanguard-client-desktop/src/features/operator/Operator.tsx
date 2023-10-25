import {ChangeEvent, useEffect, useState} from "react";
import {useOperator} from "./useOperator.tsx";
import {useStorage} from "../storage";
import {AiOutlineClose} from "react-icons/ai";

export function Operator() {
	const {loading, privateKey, error} = useOperator();
	const {data, setData, getFilePath} = useStorage();
	const [inputValue, setInputValue] = useState('');
	const [filePath, setFilePath] = useState('');
	const [openImport, setOpenImport] = useState<boolean>(false);

	useEffect(() => {
		const fetchFilePath = async () => {
			const path = await getFilePath();
			setFilePath(path);
			console.log(filePath);
		};
		void fetchFilePath();
	}, [filePath, getFilePath]);


	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleSetData = () => {
		setData({...data, arbitraryField: inputValue});
	};

	function importOperator() {
		setOpenImport(true)
	}

	function exportOperator() {
		if (privateKey && navigator.clipboard) {
			navigator.clipboard.writeText(privateKey)
				.then(() => {
					alert('Private key copied to clipboard!');
				})
				.catch(err => {
					console.error('Unable to copy to clipboard: ', err);
				});
		} else {
			console.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

	if (error) {
		alert(`Error: ${error.message}`)
	}

	return (
		<div className="w-full h-screen">
			{/*		Operator Header		*/}
			<div
				className="sticky top-0 flex flex-row items-center w-full h-16 border-b border-gray-200 pl-10 gap-2 bg-white">
				<h2 className="text-lg">Operator</h2>
			</div>

			{/*		Temp Import Modal	*/}
			{openImport && (
				<div className="absolute top-0 right-0 bottom-0 left-0 m-auto w-[500px] h-48 z-10 bg-gray-100">
					<div className="absolute top-0 right-0 cursor-pointer p-4" onClick={() => setOpenImport(false)}>
						<AiOutlineClose/>
					</div>
					<div className="w-full h-full flex flex-col justify-center items-center">
						<input
							type="text"
							value={inputValue}
							onChange={handleInputChange}
							className="w-96 mt-2 p-2 border rounded"
							placeholder="Enter Operator Private Key (no functionality)"
						/>
						<button onClick={handleSetData} className=" w-96 mt-2 p-2 bg-blue-500 text-white rounded">
							Set Data
						</button>
					</div>
				</div>
			)}

			<div className="w-full flex justify-between items-center gap-4 p-4">
				<div>
					{loading
						? <p className="text-gray-500">Loading...</p>
						: <p className="text-gray-700">Embedded Operator: {privateKey}</p>
					}
				</div>
				<div className="flex gap-4">
					<button
						className={`w-auto bg-[#F30919] text-white p-3 uppercase font-semibold mt-2`}
						onClick={() => importOperator()}
					>
						Import
					</button>

					<button
						className={`w-auto bg-[#F30919] text-white p-3 uppercase font-semibold mt-2`}
						onClick={() => exportOperator()}
					>
						Export
					</button>
				</div>
			</div>
		</div>
	)
}
