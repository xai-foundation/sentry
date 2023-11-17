import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {LuExternalLink} from "react-icons/lu";
import {AiFillCheckCircle} from "react-icons/ai";
import {useOperator} from "@/features/operator";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useSetAtom} from "jotai";
import {useSentryLogic} from "@/hooks/useSentryLogic";

export function AssignedKeysCard() {
	const setModalState = useSetAtom(modalStateAtom);
	const {publicKey: operatorAddress} = useOperator();
	const {assignedKeys} = useSentryLogic();

	function onSetKeys() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`http://localhost:7555/assign-wallet/${operatorAddress}`);
	}

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{assignedKeys ? (
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

					<button
						onClick={onSetKeys}
						className="w-full flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-4 px-6 py-2"
					>
						Assign keys from new wallet
						<LuExternalLink className="w-5 h-5"/>
					</button>
				</>
			)}
		</SquareCard>
	);
}
