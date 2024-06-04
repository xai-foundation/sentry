import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useAtomValue, useSetAtom} from "jotai";
import {accruingStateAtom} from "@/hooks/useAccruingInfo";
import {PrimaryButton} from "@sentry/ui";

export function AssignedKeysCard() {
	const setModalState = useSetAtom(modalStateAtom);
	const {publicKey: operatorAddress} = useOperator();
	const {hasAssignedKeys} = useAtomValue(accruingStateAtom);

	function onSetKeys() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`);
	}

	return (
		<SquareCard className="bg-secondaryBgColor global-cta-clip-path">
			{hasAssignedKeys ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title="Keys assigned"
					titleStyles="text-lg text-white"
					tooltip
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#FFC53D"
						title="No assigned Keys"
						tooltip={true}
						header={"Purchased keys must be assigned to Sentry Wallet"}
						body={"To assign keys, connect all wallets containing Sentry Keys"}
						body2={"The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry."}
						position={"end"}
						titleStyles="text-lg text-white"
					/>

					<p className="text-lg text-primaryText mt-1 px-7">
						At least one key must be assigned to accrue esXAI
					</p>
                    <div className="pl-7 mt-2">
					<PrimaryButton
						onClick={onSetKeys}
						btnText="Assign keys from new wallet"
						colorStyle="primary"
						size="sm"
						className="w-[280px] uppercase bg-btnPrimaryBgColor text-white hover:text-btnPrimaryBgColor font-bold"
					/>
					</div>
				</>
			)}
		</SquareCard>
	);
}
