import {SquareCard} from "../../../../components/SquareCard";
import {IconLabel} from "../../../../components/IconLabel";
import {clampAddress} from "../../../../utils/clampAddress";
import {IoMdCloseCircle} from "react-icons/io";
import {BsHourglassBottom} from "react-icons/bs";
import {AiFillCheckCircle} from "react-icons/ai";
import {Blockpass} from "@/components/blockpass/Blockpass";

export function KycRequiredCard() {

	const kycState = "pending";

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{kycState === "required" && (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title={`KYC required: ${clampAddress("0x0000000000000000000000000000000000000000")}`}
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						180 days remaining for esXAI to be claimed
					</p>

					{/*	onClick={() => setKycState("pending")}*/}
					<Blockpass/>
				</>
			)}

			{kycState === "pending" && (
				<IconLabel
					icon={BsHourglassBottom}
					color="#F59E28"
					title={`KYC pending: ${clampAddress("0x0000000000000000000000000000000000000000", 5)}`}
				/>
			)}

			{kycState === "done" && (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title={`KYC complete: ${clampAddress("0x0000000000000000000000000000000000000000", 5)}`}
				/>
			)}
		</SquareCard>
	);
}
