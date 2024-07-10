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
		<SquareCard className="bg-dynamicBlack global-cta-clip-path">
			{!status && !kycStarted && (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#FFC53D"
						title={`KYC required: ${clampAddress(wallet)}`}
						titleStyles="text-white text-lg"
					/>

					<Blockpass onClick={onStartKyc}/>
				</>
			)}

			{!status && kycStarted && (
				<>
					<IconLabel
						icon={BsHourglassBottom}
						color="#FFC53D"
						title={`KYC pending: ${clampAddress(wallet, 10)}`}
						titleStyles="text-white text-lg"
					/>

					<Blockpass onClick={onStartKyc}>
						Continue KYC
					</Blockpass>
				</>
			)}

			{status && (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#3DD68C"
					title={`KYC complete: ${clampAddress(wallet, 10)}`}
					titleStyles="text-white text-lg"
				/>
			)}
		</SquareCard>
	);
}
