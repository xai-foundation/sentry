import {AiOutlineClose} from "react-icons/ai";
import {PrimaryButton} from "@sentry/ui";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/WarningIcon";

interface ClaimBannerModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSuccess: () => void;
    isError: boolean;
    remainingRewards: number;
    claimCost: number;
    availableBalance: number;
}

const ClaimBannerModal = ({ isOpen, closeModal, onSuccess, isError, remainingRewards, claimCost, availableBalance }: ClaimBannerModalProps) => {
    return (
        <>
            {
                isOpen && <div
                    className="fixed top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-[60]">
                    <div className="w-full h-full bg-black opacity-75"/>
                    <div
                        className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[456px] h-max bg-dynamicBlack">
                        <div
                            className="p-4 w-full flex flex-col gap-4 text-cascadingWhite text-lg">
                            <div className="flex justify-between font-bold">
                                <p>Claim remaining rewards</p>
                                <span className="cursor-pointer" onClick={closeModal}>
                            <AiOutlineClose size={20} color="white"
                                            className="hover:!text-hornetSting duration-300 ease-in"/>
                        </span>
                            </div>
                            <p className="text-elementalGrey relative after:absolute after:w-[456px] after:h-[1px] after:bg-darkRoom after:bottom-[-16px] after:left-[-16px]">All
                                remaining rewards are from a previous version and will need to be manually claimed. ETH is
                                required to process this transaction.</p>
                            <div
                                className="flex w-full justify-between my-4 relative after:absolute after:w-[456px] after:h-[1px] after:bg-darkRoom after:bottom-[-16px] after:left-[-16px]">
                                <p className="text-elementalGrey">Remaining rewards</p>
                                <p>{remainingRewards} esXAI</p>
                            </div>
                            <div
                                className="flex w-full justify-between my-4 relative after:absolute after:w-[456px] after:h-[1px] after:bg-darkRoom after:bottom-[-16px] after:left-[-16px]">
                                <p className="text-elementalGrey">Cost to claim</p>
                                <div className="flex flex-col items-end">
                                    <p>~{claimCost} ETH</p>
                                    <p className="text-base text-elementalGrey">Available: {availableBalance} ETH</p>
                                </div>
                            </div>
                            {isError && <div className="flex justify-center text-liquidLava gap-1">
                                <WarningIcon fill={"#F97316"} width={20}/>
                                <p>Claim unsuccessful</p>
                            </div>}
                            <PrimaryButton onClick={onSuccess} btnText={"Claim All"} className="w-full text-xl"/>
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ClaimBannerModal;