import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useSetAtom} from "jotai";
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { AiFillCheckCircle } from "react-icons/ai";

interface BuyFlowBanner {
	quantity: number;
	promoCode: string;
}

export function BuyFlowBanner({quantity, promoCode}: BuyFlowBanner) {
	const setModalState = useSetAtom(modalStateAtom);

	return (
		<div className="w-full flex flex-col gap-4 px-6">
			<BaseCallout extraClasses={{ calloutWrapper: "bg-successBgColor", calloutFront: "flex-col !items-start text-successText !text-lg" }}>
					<span className="flex flex-row gap-1 items-center font-semibold">
						<AiFillCheckCircle className="w-6 h-6 text-successText" /> Purchase will be completed on <p
						className="text-successText">Xai.games</p>
					</span>
				<p className="text-base text-successText">
					Clicking the following button will open your browser and you will be redirected to the official
					Xai website to connect your wallet and complete your purchase. This is the official website of
					the Xai Foundation.
				</p>
			</BaseCallout>

			{/*		CTA		*/}
			<div className="pb-6 font-semibold">
				<PrimaryButton
					onClick={() => {
						setModalState(ModalView.TransactionInProgress)
						window.electron.openExternal(promoCode ? `https://sentry.xai.games/?quantity=${quantity}&promoCode=${promoCode}` : `https://sentry.xai.games/?quantity=${quantity}`)
					}}
					className={"w-full h-16 text-lg uppercase !font-bold"}
					btnText="Continue"
				/>
			</div>
		</div>
	)
}
