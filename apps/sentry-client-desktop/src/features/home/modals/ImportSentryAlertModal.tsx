import {AiOutlineClose} from "react-icons/ai";
import {Dispatch, SetStateAction} from "react";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import {PrimaryButton} from "@sentry/ui";
import {TextButton} from "@sentry/ui/dist/src/rebrand/buttons/TextButton";

interface ImportSentryAlertModalProps {
	setShowModal: Dispatch<SetStateAction<boolean>>;
	onSuccess: () => void;
}

export function ImportSentryAlertModal({setShowModal, onSuccess}: ImportSentryAlertModalProps) {
	return (
		<div
			className="fixed top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-[60]">
			<div className="w-full h-full bg-chromaphobicBlack opacity-75"/>
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[692px] h-[200px] bg-black">
				<div
					className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6 mt-[18px]">
					<div className="cursor-pointer z-10" onClick={() => setShowModal(false)}>
						<AiOutlineClose size={24} color="white" className="hover:!text-hornetSting duration-300 ease-in" />
					</div>
				</div>
				<div className="w-full h-full flex flex-col justify-center items-start gap-2 px-[40px]">
					<div className="flex items-center gap-[17px]">
						<WarningIcon width={37} height={32} />
						<p className="text-2xl font-bold text-white">
							Are you sure you want to import a new Sentry Wallet?
						</p>
					</div>
					<p className="text-elementalGrey text-[17px] font-medium ml-[55px]">
						Your old Sentry Wallet will be overwritten
					</p>

					<div className="flex justify-end w-full gap-8 mt-4">
						<TextButton
							onClick={() => onSuccess()}
							className="w-fit text-lg font-bold px-0 !py-0 "
							buttonText={"Yes, import sentry"}
						/>
						<PrimaryButton
							onClick={() => setShowModal(false)}
							wrapperClassName="w-max"
							className="w-fit text-lg uppercase font-bold px-4 !py-0 !h-[40px]"
							btnText={"No, take me back"}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
