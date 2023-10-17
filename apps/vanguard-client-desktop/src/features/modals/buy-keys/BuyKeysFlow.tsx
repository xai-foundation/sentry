import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {XaiCheckbox} from "../../../components/checkbox/XaiCheckbox.tsx";
import {XaiNumberInput} from "../../../components/input/XaiNumberInput.tsx";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";

const payWithBody = [
	{
		item: "Xai Sentry Node Key",
		currency: "Arbitrum One",
		abbr: "ETH",
		price: 0.00061,
	}
]

interface BuyKeysFlowProps {
	setPurchaseSuccess: Dispatch<SetStateAction<boolean>>;
}

export function BuyKeysFlow({setPurchaseSuccess}: BuyKeysFlowProps) {
	const [termsChecked, setTermsChecked] = useState<boolean>(false);
	const [investmentsChecked, setInvestmentsChecked] = useState<boolean>(false);
	const [ready, setReady] = useState<boolean>(false);
	const [amount, setAmount] = useState<number>(1);

	useEffect(() => {
		if (termsChecked && investmentsChecked) {
			setReady(true)
		} else {
			setReady(false);
		}
	}, [termsChecked, investmentsChecked])


	function getOrderTotal() {
		return payWithBody.map((item, i) => {
			return (
				<div className="flex flex-row items-center justify-between text-[15px]" key={`order-total-${i}`}>
					<div className="flex flex-row items-center gap-2">
						<span className="">{amount} {item.item}</span>
					</div>
					<div className="flex flex-row items-center gap-1">
						<span
							className="font-semibold">{amount > 1 ? item.price * amount : item.price} {item.abbr}</span>
					</div>
				</div>
			)
		})
	}

	return (
		// Buy State
		<div className="w-full flex flex-col gap-8 mt-12">

			{/*		Top of buy		*/}
			<div className="flex flex-col gap-2 px-6 pt-8">
				<div className="flex flex-row items-center gap-2">
					<span className="flex gap-2 items-center text-lg font-semibold">
						<XaiLogo className="w-[16px]"/>
						Xai Sentry Node Key
					</span>
				</div>
				<span className="text-sm text-[#525252]">
					Key for submitting one claim to each Xai network challenge
				</span>
			</div>

			{/*		Quantity section		*/}
			<div className="w-full flex flex-col gap-4 px-6">
				<div className="w-full flex flex-row items-center gap-2">
					<span className="w-20 text-sm uppercase text-[#A3A3A3]">
						Quantity
					</span>
				</div>

				<div>
					<XaiNumberInput
						amount={amount}
						setAmount={setAmount}
					/>
				</div>
			</div>

			{/*		Order Total section		*/}
			<div className="w-full flex flex-col gap-4">
				<div className="w-full items-center gap-2">
					<div className="w-full">
						<hr/>
					</div>
					<p className="w-12 text-sm uppercase text-[#A3A3A3] mt-4 px-6">
						Total
					</p>
				</div>

				<div className="px-6">
					{getOrderTotal()}

					<p className="text-[15px] text-[#A3A3A3] mt-1 mb-6">
						Have a referral?

						<a
							onClick={() => window.electron.openExternal('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
							className="text-[#F30919] ml-1 cursor-pointer"
						>
							+ Add referral address for a discount
						</a>
					</p>

					<hr className="my-2"/>
					<div className="flex flex-row items-center justify-between">
						<div className="flex flex-row items-center gap-2 text-lg">
							<span className="">You pay</span>
						</div>
						<div className="flex flex-row items-center gap-1">
							<span
								className="font-semibold">{amount > 1 ? payWithBody[0].price * amount : payWithBody[0].price} {payWithBody[0].abbr}</span>
						</div>
					</div>
				</div>
			</div>


			{/*		Legal / Button section		*/}
			<div className="absolute bottom-0 left-0 w-full flex flex-col gap-4">
						<div className="w-full">
							<hr/>
						</div>
				<div className="w-full flex flex-col gap-4 px-6">
					<div className="w-full items-center gap-2">
						<p className="w-12 text-sm uppercase text-[#A3A3A3]">
							Legal
						</p>
					</div>

					<XaiCheckbox
						onClick={() => setTermsChecked(!termsChecked)}
						condition={termsChecked}
					>
						I agree to the
						<a
							className="cursor-pointer text-[#F30919]"
							onClick={() => window.electron.openExternal("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
							Terms of Service
						</a>
						and the
						<a
							className="cursor-pointer text-[#F30919]"
							onClick={() => window.electron.openExternal("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
							Privacy Policy
						</a>
					</XaiCheckbox>


					<XaiCheckbox
						onClick={() => setInvestmentsChecked(!investmentsChecked)}
						condition={investmentsChecked}
					>
						I understand that Xai Vanguard Nodes are
						<a
							className="cursor-pointer text-[#F30919]"
							onClick={() => window.electron.openExternal("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
							not investments
						</a>
					</XaiCheckbox>
				</div>

				<div className="p-6">
					<button
						onClick={() => setPurchaseSuccess(true)}
						className={`w-full h-16 ${investmentsChecked && termsChecked ? "bg-[#F30919]" : "bg-gray-400 cursor-default"} text-sm text-white p-2 uppercase font-semibold`}
						disabled={!ready}
					>
						Buy Keys
					</button>
				</div>
			</div>
		</div>
	)
}
