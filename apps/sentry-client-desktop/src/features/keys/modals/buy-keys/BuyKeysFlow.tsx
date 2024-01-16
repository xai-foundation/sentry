import {useRef, useState} from "react";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {BuyKeysQuantity} from "@/features/keys/modals/buy-keys/BuyKeysQuantity";
import {BuyKeysOrderTotal} from "@/features/keys/modals/buy-keys/BuyKeysOrderTotal";
import {BuyFlowBanner} from "@/features/keys/modals/buy-keys/BuyFlowBanner";

export function BuyKeysFlow() {
	const [displayQuantity, setDisplayQuantity] = useState<number>(1);
	const [queryQuantity, setQueryQuantity] = useState<number>(displayQuantity);
	const [promoCode, setPromoCode] = useState<string>("");

	const timer = useRef<ReturnType<typeof setTimeout>>();

	const intermediaryStep = (_quantity: number) => {
		clearTimeout(timer.current);
		setDisplayQuantity(_quantity);

		timer.current = setTimeout(() => {
			setQueryQuantity(_quantity);
		}, 500)
	}

	return (
		<div className="relative w-full h-screen flex flex-col gap-8">
			{/*		Top of buy		*/}
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-2 px-6 pt-8">
					<div className="flex flex-row items-center gap-2">
					<span className="flex gap-3 items-center text-lg font-semibold">
						<XaiLogo className="w-[16px] text-[#F30919]"/>
						Xai Sentry Node Key
					</span>
					</div>
					<span className="text-sm text-[#525252]">
					Key for submitting one claim to each Xai network challenge
				</span>
				</div>
				{/*		Quantity section		*/}
				<BuyKeysQuantity
					quantity={displayQuantity}
					setQuantity={intermediaryStep}
				/>
			</div>

			{/*		Order Total section		*/}
			<BuyKeysOrderTotal
				quantity={queryQuantity}
				promoCode={promoCode}
				setPromoCode={setPromoCode}
			/>

			{/*		Banner section		*/}
			<BuyFlowBanner
				quantity={displayQuantity}
				promoCode={promoCode}
			/>
		</div>
	)
}
