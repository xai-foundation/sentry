import {SquareCard} from "@/components/SquareCard";
import {IconLabel} from "@/components/IconLabel";
import {clampAddress} from "@/utils/clampAddress";
import {IoMdCloseCircle} from "react-icons/io";
import {BsHourglassBottom} from "react-icons/bs";
import {AiFillCheckCircle} from "react-icons/ai";
import {Blockpass} from "@/components/blockpass/Blockpass";

interface KycRequiredCardProps {
	wallet: string;
	status: boolean;
}

export function KycRequiredCard({wallet, status}: KycRequiredCardProps) {

	// todo write to disk when user opens KYC prompt and check against this new map for the false & true below

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{!status && false && (
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

			{!status && true && (
				<IconLabel
					icon={BsHourglassBottom}
					color="#F59E28"
					title={`KYC pending: ${clampAddress("0x0000000000000000000000000000000000000000", 5)}`}
				/>
			)}

			{status && (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title={`KYC complete: ${clampAddress(wallet, 5)}`}
				/>
			)}
		</SquareCard>
	);
}
