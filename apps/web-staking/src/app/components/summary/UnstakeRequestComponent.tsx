import { UnstakeRequest } from "@/services/web3.service";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent"
import { PrimaryButton } from "../buttons/ButtonsComponent";
import moment from "moment";
import { useEffect, useState } from "react";

interface UnstakeRequestProps {
	unstakeRequest: UnstakeRequest;
	isClaimable: boolean;
	onClaimRequest: (unstakeRequest: UnstakeRequest, onComplete: Function) => {}
}

const UnstakeRequestComponent = ({ unstakeRequest, isClaimable, onClaimRequest }: UnstakeRequestProps) => {
	moment.relativeTimeThreshold('ss', 0);

	const [claimable, setClaimable] = useState(isClaimable);
	const [timeLeft, setTimeLeft] = useState(unstakeRequest.lockTime - Date.now() || null);
	const [transactionPending, setTransactionPending] = useState(false);

	const sendClaimRequest = () => {
		setTransactionPending(true);
		onClaimRequest(unstakeRequest, onComplete);
	}

	const onComplete = () => {
		setTransactionPending(false);
	}

	const createCurrencyString = () => {
		let currency = 'esXAI';

		if (unstakeRequest.isKeyRequest) {
			currency = 'key';

			if (unstakeRequest.amount > 1) {
				return currency + 's'
			}
		}

		return currency;
	}

	useEffect(() => {
		if (timeLeft && timeLeft > 0) {
			setTimeout(() => {
				setTimeLeft(null);
				setClaimable(true);
			}, timeLeft);
		}
	}, [timeLeft]);

	return (
		<BorderWrapperComponent customStyle="my-5 rounded-2xl border-1 px-[24px] py-[21px] shadow-md md:my-16">
			<div className="flex flex-col">
				<span className="text-[16px] text-lightBlackDarkWhite">
					Unstake Request
				</span>
				<div className="flex justify-end">
					<span className="text-[32px] text-lightBlackDarkWhite">
						{unstakeRequest.amount} {createCurrencyString()}
					</span>
				</div>
				<div className="flex flex-row w-full justify-between">
					<div className="flex flex-col">
						<div>
							Created
						</div>
						<div>
							{new Date(unstakeRequest.lockTime).toLocaleDateString()}&nbsp;
							{new Date(unstakeRequest.lockTime).toLocaleTimeString().substring(0, 5)}
						</div>
					</div>
					<div className="flex justify-end">
						{claimable && <PrimaryButton
							className="disabled:opacity-50"
							btnText="Claim"
							onClick={sendClaimRequest}
							isDisabled={transactionPending}
						/>}
						{!claimable && <div className="flex flex-col">
							<div>
								Remaining
							</div>
							<div className="flex justify-end">
								{moment.duration(timeLeft).humanize()}
							</div>
						</div>}
					</div>
				</div>
			</div>
		</BorderWrapperComponent>
	);
};

export default UnstakeRequestComponent;
