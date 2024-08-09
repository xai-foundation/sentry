import { PrimaryButton } from "@sentry/ui/src/rebrand";
import { FaCircleCheck } from "react-icons/fa6";
import { useWebBuyKeysContext } from "../contexts/useWebBuyKeysContext";


interface IPurchaseSuccessful {
    returnToClient: (hash: string) => void;
}

const PurchaseSuccessful: React.FC<IPurchaseSuccessful> = ({ returnToClient }) => {
    const { mintWithEth, mintWithXai, blockExplorer } = useWebBuyKeysContext();

	const getHash = () => {
		const hash = mintWithEth.data ?? mintWithXai.data;
		if(!hash) {
			throw new Error("No hash found");
		}
		return hash;
	}

	const handleReturnToClient = () => {
		returnToClient(getHash());
	}



    return (
            <div className="flex flex-col justify-center items-center sm:max-w-[90%] lg:w-[844px] lg:px-[60px] lg:py-[40px] sm:px-[20px] sm:py-[35px] bg-darkLicorice m-4 shadow-main">
				<div className="flex flex-col justify-center items-center gap-2">
					<FaCircleCheck color={"#16A34A"} size={64}/>
					<span className="text-3xl text-white text-center uppercase font-bold mt-2">Purchase successful</span>
					<div className="flex lg:flex-row sm:flex-col break-words"> 
					<span className="text-[18px] sm:text-center text-elementalGrey">Transaction ID:</span>
					<a
						onClick={() => window.open(`${blockExplorer}/tx/${getHash()}`)}
							className="text-white text-center underline ml-1 cursor-pointer text-[18px] sm:max-w-[260px] lg:max-w-full"
						>
						{getHash()}
					</a>
					</div>
					<PrimaryButton onClick={handleReturnToClient} btnText={"Return to Xai Client"} colorStyle="primary" className="w-full text-white text-xl font-bold my-8 uppercase"/>
					<div className="flex lg:flex-row sm:flex-col items-center text-[18px] text-americanSilver mt-1">
						<span>Haven't installed Xai Client yet?</span>
						<a
							onClick={() => window.open("https://xai.games/sentrynodes/", "_blank", "noopener noreferrer")}
							className="text-[#F30919] ml-1 cursor-pointer font-bold"
						>
							Download it here.
						</a>
					</div>
				</div>
        </div>
    );
};

export default PurchaseSuccessful;
