import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager";
import {AiFillCheckCircle, AiFillWarning, AiOutlineClose} from "react-icons/ai";
import {IoMdCloseCircle} from "react-icons/io";
import {IconLabel} from "../../../../components/IconLabel";
import {SquareCard} from "../../../../components/SquareCard";
import {SentryActiveCard} from "./SentryActiveCard";
import {InsufficientFundsCard} from "./InsufficientFundsCard";
import {AssignedKeysCard} from "./AssignedKeysCard";
import {useState} from "react";

export function ActionsRequiredNotAccruingModal() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	// const {isLoading, data: balance, error} = useBalance("0xB065D33B024F87c07E7AaC14E87b5d76e3162647"); // spencer test wallet

	const [testState, setTestState] = useState({
		active: false,
		funded: false,
		keys: false,
	});

	return (
		<div className="w-full h-full flex flex-col justify-start border border-gray-200 z-20 bg-white">
			<div
				className="w-full h-16 flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<div className="flex flex-row gap-2 items-center">
					<AiFillWarning className="w-7 h-7 text-[#F59E28]"/> <span>Actions required</span>
				</div>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose/>
				</div>
			</div>

			<div className="p-5">
				{(testState.active && testState.funded && testState.keys) ? (
					<SquareCard className="bg-[#DCFCE7]">
						<IconLabel
							icon={AiFillCheckCircle}
							color="#16A34A"
							title="You are currently accruing esXAI"
						/>
						<p className="text-[15px] text-[#15803D] mt-2">
							Keep your Sentry Wallet running 24/7 to continue accruing esXAI.
						</p>
					</SquareCard>
				) : (
					<SquareCard>
						<IconLabel
							icon={IoMdCloseCircle}
							color="#F59E28"
							title="You are currently not accruing esXAI"
						/>
						<p className="text-[15px] text-[#924012] mt-2">
							Complete the steps below to begin accruing esXAI token rewards.
						</p>
					</SquareCard>
				)}

				<div className="flex flex-col gap-3 mt-3">
					<SentryActiveCard
						active={testState.active}
						setActive={() => setTestState((_state) => {return {..._state, active: true}})}
					/>

					<InsufficientFundsCard
						funded={testState.funded}
						setFunded={() => setTestState((_state) => {return {..._state, funded: true}})}
					/>

					<AssignedKeysCard
						keys={testState.keys}
						setKeys={() => setTestState((_state) => {return {..._state, keys: true}})}
					/>
				</div>
			</div>
		</div>
	);
}
