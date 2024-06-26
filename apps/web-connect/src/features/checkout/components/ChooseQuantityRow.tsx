import { InfoPointRed, RedSentryIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import {Tooltip, XaiNumberInput} from "@sentry/ui";
import { Dispatch, SetStateAction } from "react";
import { useGetTotalSupplyAndCap } from "../hooks";

interface IChooseQuantityRow {
	quantity: number;
	setQuantity: Dispatch<SetStateAction<number>>;
}

export function ChooseQuantityRow(props: IChooseQuantityRow){
    const {quantity, setQuantity} = props;
	const {data: getTotalData} = useGetTotalSupplyAndCap();
	const maxSupply = getTotalData ? Number(getTotalData.maxSupply) - Number(getTotalData.totalSupply) : 0;
    
    return (
        <div className="flex sm:flex-col lg:flex-row justify-between lg:items-start sm:items-center">
			<div className="flex flex-col sm:items-center lg:items-start gap-2">
				<div className="flex flex-row sm:w-full sm:justify-center lg:justify-start items-center gap-1">
					<RedSentryIcon width={32} height={32} />
					<p className="sm:text-2xl lg:text-3xl text-white font-bold">
						XAI SENTRY NODE KEY
					</p>
					<span className="h-full flex items-center ml-2"><Tooltip
						header={"Xai keys are required for nodes to receive $esXAI network rewards."}
						body={"All purchases must be made in Arbitrum ETH."}
						width={452}
					>
						<InfoPointRed/>
					</Tooltip></span>
				</div>
				<p className="sm:w-full lg:w-[400px] sm:text-center sm:px-8 lg:px-0 lg:text-left text-[18px] text-elementalGrey font-medium">
					Each Sentry Node Key enables you to submit up to 1 reward claim for each network challenge.
				</p>
			</div>
				{/*		Quantity section		*/}
				<div className="flex w-full justify-end flex-row items-start gap-4 sm:mt-4 lg:mt-0">

			<div className="flex sm:w-full lg:w-[175px] sm:px-2 lg:px-0">
				<XaiNumberInput
					quantity={quantity}
					setQuantity={setQuantity}
					maxSupply={maxSupply}
				/>
			</div>
		</div>
		</div>
    )
}