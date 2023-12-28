import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useAtomValue, useSetAtom} from "jotai";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {BiLinkExternal} from "react-icons/bi";
import {XaiButton} from "@sentry/ui";

export function AssignedKeysCard() {
	const setModalState = useSetAtom(modalStateAtom);
	const {publicKey: operatorAddress} = useOperator();
	const {hasAssignedKeys} = useAtomValue(accruingStateAtom);

	function onSetKeys() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`);
	}

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{hasAssignedKeys ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title="Keys assigned"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title="No Assigned Keys"
						tooltip={true}
						header={"Purchased keys must be assigned to Sentry Wallet"}
						body={"To assign keys, connect all wallets containing Sentry Keys"}
						body2={"The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry."}
						position={"end"}
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						At least one key must be assigned to accrue esXAI
					</p>

					<XaiButton
						onClick={onSetKeys}
						width={"100%"}
						fontSize={"15px"}
					>
						Assign keys from new wallet
						<BiLinkExternal className="w-5 h-5"/>
					</XaiButton>
				</>
			)}
		</SquareCard>
	);
}
