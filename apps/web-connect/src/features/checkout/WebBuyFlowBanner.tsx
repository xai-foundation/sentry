import {XaiCheckbox} from "@xai-vanguard-node/ui/dist/src/features/checkbox/XaiCheckbox";
import {Dispatch, SetStateAction, useState} from "react";

interface WebBuyFlowBanner {
	setPurchase: Dispatch<SetStateAction<boolean>>;
}

export function WebBuyFlowBanner({setPurchase}: WebBuyFlowBanner) {
	const [terms, setTerms] = useState<boolean>(false);
	const [investments, setInvestments] = useState<boolean>(false);
	const ready = terms && investments;

	return (
		<div className="flex flex-col justify-center gap-8 p-6 mt-8">
			<div className="flex flex-col justify-center gap-2">
				<XaiCheckbox
					onClick={() => setTerms(!terms)}
					condition={terms}
				>
					I agree to the
					<a
						className="cursor-pointer text-[#F30919]"
						onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
						Terms of Service
					</a>
					and the
					<a
						className="cursor-pointer text-[#F30919]"
						onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
						Privacy Policy
					</a>
				</XaiCheckbox>


				<XaiCheckbox
					onClick={() => setInvestments(!investments)}
					condition={investments}
				>
					I understand that Xai Vanguard Nodes are
					<a
						className="cursor-pointer text-[#F30919]"
						onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
						not investments
					</a>
				</XaiCheckbox>
			</div>

			<div>
				<button
					onClick={() => setPurchase}
					className={`w-full h-16 ${investments && terms ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
					disabled={!ready}
				>
					Confirm purchase
				</button>
			</div>
		</div>
	)
}
