import {SquareCard} from "@/components/SquareCard";
import {IconLabel} from "@/components/IconLabel";
import {clampAddress} from "@/utils/clampAddress";
import {IoMdCloseCircle} from "react-icons/io";
import {useStorage} from "@/features/storage";
import {BsHourglassBottom} from "react-icons/bs";
import {AiFillCheckCircle} from "react-icons/ai";
import {Blockpass} from "@/components/blockpass/Blockpass";

interface KycRequiredCardProps {
	wallet: string;
	status: boolean;
}

export function KycRequiredCard({wallet, status}: KycRequiredCardProps) {
	const {data, setData} = useStorage();
	const kycStarted = (data?.kycStartedWallets || []).indexOf(wallet) > -1;

	function onStartKyc() {
		const kycStartedWallets = data?.kycStartedWallets || [];
		if (kycStartedWallets.indexOf(wallet) < 0) {
			kycStartedWallets.push(wallet);
		}

		setData({
			...data,
			kycStartedWallets,
		});
	}

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{!status && !kycStarted && (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title={`KYC required: ${clampAddress(wallet)}`}
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						180 days remaining for esXAI to be claimed
					</p>
					<Blockpass onClick={onStartKyc}/>
				</>
			)}

			{!status && kycStarted && (
				<>
					<IconLabel
						icon={BsHourglassBottom}
						color="#F59E28"
						title={`KYC pending: ${clampAddress(wallet, 10)}`}
					/>

					<Blockpass onClick={onStartKyc}>
						Continue KYC
					</Blockpass>
				</>
			)}

			{status && (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title={`KYC complete: ${clampAddress(wallet, 10)}`}
				/>
			)}
		</SquareCard>
	);
}
