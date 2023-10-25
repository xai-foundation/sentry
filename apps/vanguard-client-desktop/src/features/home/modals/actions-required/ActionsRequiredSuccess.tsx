import {FaCircleCheck} from "react-icons/fa6";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {BiLoaderAlt} from "react-icons/bi";
import {useNavigate} from "react-router-dom";

interface ActionsRequiredSuccessProps {
	setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function ActionsRequiredSuccess({setShowModal}: ActionsRequiredSuccessProps) {
	const [loading, setLoading] = useState<boolean>(true)
	const navigate = useNavigate();

	// todo: setup real loading logic, this is for demo purposes only
	useEffect(() => {
		setLoadingTrueAfterDelay();
	}, []);

	const setLoadingTrueAfterDelay = () => {
		setTimeout(() => {
			setLoading(false);
			handleSuccess()
		}, 2000);
	};

	const handleSuccess = () => {
		setTimeout(() => {
			setShowModal(false);
			navigate("/keys")
		}, 2000);
	};


	return (
		<div className="w-auto h-auto">

			{loading ? (
				<div
					className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
					<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
					<span className="text-lg">Adding wallet...</span>
				</div>

			) : (
				<div
					className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
					<FaCircleCheck color={"#16A34A"} size={32}/>
					<span className="text-lg">Wallet added successfully</span>
				</div>
			)}
		</div>
	)
}
