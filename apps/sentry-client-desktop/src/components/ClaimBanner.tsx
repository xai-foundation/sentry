import { useState } from "react";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { PrimaryButton, WarningIcon } from "@sentry/ui";
import { AiOutlineClose } from "react-icons/ai";
import { useAtomValue } from "jotai";
import { chainStateAtom, useChainDataRefresh } from "@/hooks/useChainDataWithCallback";
import { useBalance } from "@/hooks/useBalance";
import { useOperator } from "@/features/operator";
import { useStorage } from "@/features/storage";
import { processUnclaimedChallenges } from "@sentry/core";
import toast from "react-hot-toast";

export function ClaimBanner() {

    const {
        unclaimedEsXaiFromSoloSubmission,
        estimateGasForUnclaimed
    } = useAtomValue(chainStateAtom);

    const { refresh } = useChainDataRefresh();

    const { publicKey, signer } = useOperator();
    const { data: ethBalance } = useBalance(publicKey);
    const { data } = useStorage();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessingUnclaimed, setIsProcessingUnclaimed] = useState(false);
    const [claimError, setClaimError] = useState("");

    const onOpenModal = () => {
        setIsModalOpen(true)
    }

    const onCloseModal = () => {
        setIsModalOpen(false)
    }

    const onClaim = async () => {
        if (isProcessingUnclaimed) {
            return;
        }
        if (!signer) {
            return;
        }

        setIsProcessingUnclaimed(true);
        setClaimError("");
        try {
            // Adding the "ts-ignore" to avoid ts error for different module exports of sentry core and the desktop client.
            // @ts-ignore
            await processUnclaimedChallenges(signer, console.log, data?.whitelistedWallets);
            setIsProcessingUnclaimed(false);
            setIsModalOpen(false);
            toast.success("Successfully claimed previous submissions", {duration: 10000});
            refresh();

        } catch (error) {
            console.error("Failed to process unclaimed", error);
            setIsProcessingUnclaimed(false);
            setClaimError("Failed to process");
        }

    }

    return <>

        {unclaimedEsXaiFromSoloSubmission > 0 && <BaseCallout extraClasses={{
            calloutWrapper: "w-full bg-potBlack mb-4",
            calloutFront: "!items-start flex-col bg-potBlack"
        }}>
            <div className="flex justify-between items-center w-full">
                <div>
                    <p className="font-semibold text-cascadingWhite">
                        Rewards remaining from a previous version need to be manually claimed
                    </p>

                    <p className="text-elementalGrey">
                        {unclaimedEsXaiFromSoloSubmission} esXAI remaining

                    </p>
                </div>
                <PrimaryButton
                    onClick={onOpenModal}
                    btnText={"CLAIM"}
                    wrapperClassName={"w-max !keys-cta-button-clip-path"}
                    className={"!py-[6px] h-max !keys-cta-button-clip-path"}
                    colorStyle={"outline"}
                />
            </div>
        </BaseCallout>}

        {isModalOpen && <div
            className="fixed top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-[60]">
            <div className="w-full h-full bg-black opacity-75" />
            <div
                className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[456px] h-max bg-dynamicBlack">
                <div
                    className="p-4 w-full flex flex-col gap-4 text-cascadingWhite text-lg">
                    <div className="flex justify-between font-bold">
                        <p>Claim remaining rewards</p>
                        <span className="cursor-pointer" onClick={onCloseModal}>
                            <AiOutlineClose size={20} color="white"
                                className="hover:!text-hornetSting duration-300 ease-in" />
                        </span>
                    </div>
                    <p className="text-elementalGrey relative after:absolute after:w-[456px] after:h-[1px] after:bg-darkRoom after:bottom-[-16px] after:left-[-16px]">All
                        remaining rewards are from a previous version and will need to be manually claimed. ETH is
                        required to process this transaction.</p>
                    <div
                        className="flex w-full justify-between my-4 relative after:absolute after:w-[456px] after:h-[1px] after:bg-darkRoom after:bottom-[-16px] after:left-[-16px]">
                        <p className="text-elementalGrey">Remaining rewards</p>
                        <p>{unclaimedEsXaiFromSoloSubmission} esXAI</p>
                    </div>
                    <div
                        className="flex w-full justify-between my-4 relative after:absolute after:w-[456px] after:h-[1px] after:bg-darkRoom after:bottom-[-16px] after:left-[-16px]">
                        <p className="text-elementalGrey">Cost to claim</p>
                        <div className="flex flex-col items-end">
                            <p>~{estimateGasForUnclaimed} ETH</p>
                            <p className="text-base text-elementalGrey">Available: {Number(ethBalance?.ethString)} ETH</p>
                        </div>
                    </div>
                    {claimError && <div className="flex justify-center text-liquidLava gap-1">
                        <WarningIcon fill={"#F97316"} width={20} />
                        <p>Claim unsuccessful</p>
                    </div>}
                    <PrimaryButton
                        onClick={onClaim}
                        btnText={isProcessingUnclaimed ? "Loading..." : "Claim All"}
                        className="w-full text-xl"
                        isDisabled={isProcessingUnclaimed}
                    />
                </div>
            </div>
        </div>}
    </>
}