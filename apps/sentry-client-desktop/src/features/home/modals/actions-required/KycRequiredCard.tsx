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
						title={`KYC pending: ${clampAddress(wallet, 5)}`}
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						Check back in 48 hours if all docs submitted. Check your inbox (including spam)
						for updates. For KYC issues, contact <a className="text-[#F30919] cursor-pointer" href={"https://help.blockpass.org/hc/en-us/requests/new"}>Blockpass</a>.
						If not completed, continue submission here.
					</p>

					<Blockpass onClick={onStartKyc}>
						Continue KYC
					</Blockpass>
				</>
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
