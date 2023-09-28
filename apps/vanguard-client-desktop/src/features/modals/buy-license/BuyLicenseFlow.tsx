import {Dispatch, SetStateAction} from "react";

const payWithBody = [
	{
		currency: "Ethereum",
		abbr: "ETH",
		price: "0.00051",
	},
	{
		currency: "Arbitrum",
		abbr: "ARB",
		price: "51.8",
	},
]

const orderTotalBody = [
	{
		item: "1 Xai Vanguard Node License",
		price: "0.00061 ETH",
	},
	{
		item: "Gas Fee (5%)",
		price: "0.000031 ETH",
	},
]

interface BuyLicenseFlowProps {
	setPurchaseSuccess: Dispatch<SetStateAction<boolean>>;
}

export function BuyLicenseFlow({setPurchaseSuccess}: BuyLicenseFlowProps) {


	function getPayWith() {
		return payWithBody.map((item, i) => {
			return (
				<div className="flex flex-row items-center justify-between" key={`currency-${i}`}>
					<div className="flex flex-row items-center gap-2">
						<input type={"radio"}/>
						<span>{item.currency}</span>
						<span className="text-[#A3A3A3] text-sm">{item.abbr}</span>
					</div>
					<div className="flex flex-row items-center gap-1">
						<span>{item.price} {item.abbr}</span>
						<span className="text-[#A3A3A3]">per license</span>
					</div>
				</div>
			)
		})
	}

	function getOrderTotal() {
		return orderTotalBody.map((item, i) => {
			return (
				<div className="flex flex-row items-center justify-between text-[#A3A3A3]" key={`order-total-${i}`}>
					<div className="flex flex-row items-center gap-2">
						<span className="">{item.item}</span>
					</div>
					<div className="flex flex-row items-center gap-1">
						<span>{item.price}</span>
					</div>
				</div>
			)
		})
	}

	return (
		// Buy State
		<div className="flex flex-col gap-10 mt-12">

			{/*		Top of buy		*/}
			<div className="flex flex-col gap-2">
				<div className="flex flex-row items-center gap-2">
					<span className="text-lg font-semibold">Xai Vanguard Node License</span>
					<span className="text-sm bg-gray-100 pl-2 pr-2 rounded-2xl text-gray-500">
									42,069 remaining
								</span>
				</div>
				<span className="text-sm text-[#525252]">
							License for submitting one claim to each Xai network challenge
						</span>
			</div>


			{/*		Pay with section		*/}
			<div className="w-full flex flex-col gap-4">
				<div className="w-full flex flex-row items-center gap-2">
							<span className="w-20 text-sm uppercase text-[#A3A3A3]">
								Pay with
							</span>
					<div className="w-full">
						<hr/>
					</div>
				</div>

				<div>
					{getPayWith()}
				</div>
			</div>

			{/*		Quantity section		*/}
			<div className="w-full flex flex-col gap-4">
				<div className="w-full flex flex-row items-center gap-2">
							<span className="w-20 text-sm uppercase text-[#A3A3A3]">
								Quantity
							</span>
					<div className="w-full">
						<hr/>
					</div>
				</div>

				<div>
					<input className="w-full h-12 border border-gray-200" type={"number"}/>
				</div>
			</div>

			{/*		Order Total section		*/}
			<div className="w-full flex flex-col gap-4">
				<div className="w-full flex flex-row items-center gap-2">
							<span className="w-32 text-sm uppercase text-[#A3A3A3]">
								Order Total
							</span>
					<div className="w-full">
						<hr/>
					</div>
				</div>

				<div>
					{getOrderTotal()}

					<hr className="my-2"/>
					<div className="flex flex-row items-center justify-between">
						<div className="flex flex-row items-center gap-2">
							<span className="">You will pay</span>
						</div>
						<div className="flex flex-row items-center gap-1">
							<span>{orderTotalBody[0].price + orderTotalBody[1].price}</span>
						</div>
					</div>
				</div>
			</div>


			{/*		Legal / Button section		*/}
			<div className="absolute bottom-0 left-0 w-full flex flex-col gap-10 p-6">
				<div className="w-full flex flex-col gap-4">
					<div className="w-full flex flex-row items-center gap-2">
								<span className="w-20 text-sm uppercase text-[#A3A3A3]">
									Legal
								</span>
						<div className="w-full">
							<hr/>
						</div>
					</div>

					<div>
						<div className="w-full flex flex-row items-center gap-2 text-sm">
							<input type={"checkbox"}/>
							<div className="flex flex-row gap-1">
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
							</div>
						</div>
						<div className="w-full flex flex-row items-center gap-2 text-sm">
							<input type={"checkbox"}/>
							<div className="flex flex-row gap-1">
								I understand that Xai Vanguard Nodes are
								<a
									className="cursor-pointer text-[#F30919]"
									onClick={() => window.electron.openExternal("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}>
									not investments
								</a>
							</div>
						</div>
					</div>
				</div>

				<div>
					<button
						onClick={() => setPurchaseSuccess(true)}
						className="w-full h-16 bg-[#F30919] text-sm text-white p-2 uppercase font-semibold"
					>
						Buy License
					</button>
				</div>
			</div>
		</div>
	)
}
