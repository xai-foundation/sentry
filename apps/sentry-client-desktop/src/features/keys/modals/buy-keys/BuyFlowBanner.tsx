import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useSetAtom} from "jotai";
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { AiFillCheckCircle } from "react-icons/ai";
import { config } from "@sentry/core";

interface BuyFlowBanner {
	quantity: number;
	promoCode: string;
}

export function BuyFlowBanner({quantity, promoCode}: BuyFlowBanner) {
	const setModalState = useSetAtom(modalStateAtom);

	return (
		<div className="w-full flex flex-col gap-4 px-6">
			<BaseCallout extraClasses={{ calloutWrapper: "!bg-drunkenDragonFly/10", calloutFront: "flex-col !items-start text-drunkenDragonFly !text-lg" }}>
					<span className="flex flex-row gap-1 items-center font-semibold">
						<AiFillCheckCircle className="w-6 h-6 text-drunkenDragonFly" /> Purchase will be completed on <p
						className="text-drunkenDragonFly">Xai.games</p>
					</span>
				<p className="text-base text-drunkenDragonFly">
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
						window.electron.openExternal(promoCode ? `${config.sentryKeySaleURI}/?quantity=${quantity}&promoCode=${promoCode}` : `${config.sentryKeySaleURI}/?quantity=${quantity}`)
					}}
					className={"w-full h-16 text-lg uppercase !font-bold"}
					btnText="Continue"
				/>
			</div>
		</div>
	)
}
