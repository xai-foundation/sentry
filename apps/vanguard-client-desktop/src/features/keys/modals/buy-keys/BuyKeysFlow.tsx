import {Dispatch, SetStateAction, useState} from "react";
import {XaiNumberInput} from "@xai-vanguard-node/ui";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {BiLinkExternal} from "react-icons/bi";
import {AiOutlineClose, AiOutlineInfoCircle} from "react-icons/ai";
import {MdVerifiedUser} from "react-icons/md";

const payWithBody = [
	{
		item: "Xai Sentry Node Key",
		abbr: "ETH",
		price: 0.000641,
	}
]

interface BuyKeysFlowProps {
	setPurchaseSuccess: Dispatch<SetStateAction<boolean>>;
}

export function BuyKeysFlow({setPurchaseSuccess}: BuyKeysFlowProps) {
	const [amount, setAmount] = useState<number>(1);
	const [promo, setPromo] = useState<boolean>(false);
	const [inputValue, setInputValue] = useState('');

	const [discountApplied, setDiscountApplied] = useState<boolean>(false);
	const [discountError, setDiscountError] = useState<boolean>(false);

	// Calculate 5% of the number
	const discountPrice = (5 / 100) * payWithBody[0].price;

	const discount = {
		item: "Discount (5%)",
		abbr: "ETH",
		price: discountPrice * -1,
	};

	const handleSubmit = () => {
		setDiscountError(false);
		if (inputValue === "IDONTWANNAPAYFULLPRICE") {
			setDiscountApplied(true);
		} else {
			setDiscountError(true);
			setInputValue("");
		}
	};

	function getOrderTotal() {
		return payWithBody.map((item, i) => {
			return (
				<div className="flex flex-row items-center justify-between text-[15px]" key={`order-total-${i}`}>
					<div className="flex flex-row items-center gap-2">
						<span className="">{amount} x {item.item}</span>
					</div>
					<div className="flex flex-row items-center gap-1">
						<span className="font-semibold">{Number(item.price * amount).toFixed(6)} {item.abbr}</span>
					</div>
				</div>
			)
		})
	}

	function getDiscount() {
		return (
			<div className="flex flex-row items-center justify-between text-[15px]">
				<div className="flex flex-row items-center gap-2">
					<span>{discount.item}</span>

					<a
						onClick={() => setDiscountApplied(false)}
						className="text-[#F30919] ml-1 cursor-pointer"
					>
						Remove
					</a>

				</div>
				<div className="flex flex-row items-center gap-1">
					<span className="text-[#2A803D] font-semibold">{discount.price * amount} {discount.abbr}</span>
				</div>
			</div>
		)
	}

	return (
		// Buy State
		<div className="w-full flex flex-col gap-8 mt-12">

			{/*		Top of buy		*/}
			<div className="flex flex-col gap-2 px-6 pt-8">
				<div className="flex flex-row items-center gap-2">
					<span className="flex gap-3 items-center text-lg font-semibold">
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
					<div className="w-12 flex flex-row text-sm uppercase text-[#A3A3A3] mt-4 px-6">
						<p className="flex items-center gap-1">
							Total
							<AiOutlineInfoCircle size={16}/>
						</p>
					</div>
				</div>

				<div className="px-6">
					{getOrderTotal()}
					<p className="text-[13px] text-[#A3A3A3] mb-4">
						{payWithBody[0].price} {payWithBody[0].abbr} per key
					</p>

					{discountApplied && (
						<>
							{getDiscount()}
							<p className="text-[13px] text-[#A3A3A3] mb-4">
								0xBAbeCC…dd65cd85
							</p>
						</>

					)}

					<hr className="my-2"/>

					{/*		Promo section		*/}
					{promo ? (
						<div>
							<div
								className="w-full h-auto flex flex-row justify-between items-center text-[15px] text-[#525252] mt-2 py-2">
								<span>Add promo code</span>
								<div className="cursor-pointer z-10" onClick={() => setPromo(false)}>
									<AiOutlineClose/>
								</div>
							</div>

							<div className="flex gap-2 items-center">

								<input
									type="text"
									value={inputValue}
									onChange={(e) => {
										setInputValue(e.target.value)
										setDiscountError(false);
									}}
									className={`w-full my-2 p-2 border ${discountError ? "border-[#AB0914]": "border-[#A3A3A3]"}`}
									placeholder="Enter promo code"
								/>

								<button
									onClick={() => handleSubmit()}
									className="flex flex-row justify-center items-center w-[92px] p-2 bg-[#F30919] text-[15px] text-white font-semibold uppercase"
								>
									Apply
								</button>
							</div>

							{discountError && (
								<p className="text-[14px] text-[#AB0914]">Invalid referral address</p>
							)}
						</div>
					) : (
						<p className="text-[15px] py-2">
							<a
								onClick={() => setPromo(true)}
								className="text-[#F30919] ml-1 cursor-pointer"
							>
								+ Add promo code
							</a>
						</p>
					)}

					<hr className="my-2"/>
					<div className="flex flex-row items-center justify-between">
						<div className="flex flex-row items-center gap-2 text-lg">
							<span className="">You pay</span>
						</div>
						<div className="flex flex-row items-center gap-1 font-semibold">
							<span>
								{discountApplied
									? Number((payWithBody[0].price * amount) - (discountPrice * amount)).toFixed(8)
									: Number(payWithBody[0].price * amount).toFixed(8)}
							</span>
							<span>
								{payWithBody[0].abbr}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/*		Banner section		*/}
			<div className="absolute bottom-0 left-0 w-full flex flex-col gap-4 px-6">
				<div className="flex flex-col gap-2 bg-[#DCFCE6] p-6">
					<span className="flex flex-row gap-1 items-center font-semibold">
						<MdVerifiedUser size={22} color={"#38A349"}/> Purchase will be completed on <p
						className="text-[#2A803D]">Xai.games</p>
					</span>
					<p className="text-[15px] text-[#15803D]">
						Clicking the following button will open your browser and you will be redirected to the official
						Xai website to connect your wallet and complete your purchase. This is the official website of
						the Xai Foundation.
					</p>
				</div>

				{/*		CTA		*/}
				<div className="pb-6 font-semibold">
					<button
						onClick={() => {
							window.electron.openExternal('http://localhost:7555/')
							setPurchaseSuccess(true)
						}}
						className={`w-full h-16 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-lg text-white`}
					>
						Confirm purchase <BiLinkExternal/>
					</button>
				</div>
			</div>
		</div>
	)
}
