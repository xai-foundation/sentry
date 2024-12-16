import React, { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { config, formatWeiToEther } from "@sentry/core";
import { CloseIcon } from "@sentry/ui";
import { CrossmintEmbeddedCheckout, useCrossmintCheckout } from "@crossmint/client-sdk-react-ui";
import { MintWithCrossmintStatus } from "@/features/hooks";
import { useWebBuyKeysContext } from "@/features/checkout/contexts/useWebBuyKeysContext";
import { useTranslation } from "react-i18next";

interface CrossmintModalProps {
    isOpen: boolean;
    totalQty: number;
    totalPriceInETH: string;
    totalPriceInUsdc: string;
    promoCode: string;
    onClose: () => void;
}

const CrossmintModal: React.FC<CrossmintModalProps> = ({ isOpen, onClose, totalQty, /*totalPriceInUsdc,*/ totalPriceInETH, promoCode }) => {
    const collectionId = config.crossmintCollectionId;
    const { address } = useAccount();
    const { order } = useCrossmintCheckout();
    const { setMintWithCrossmint } = useWebBuyKeysContext();
    const [mintTxData, setMintTxData] = useState<MintWithCrossmintStatus>({ txHash: "", orderIdentifier: "" });
    const { t: translate } = useTranslation("Checkout");  

    const handleClose = () => {
        setMintWithCrossmint(mintTxData.txHash === "" ? { txHash: "", orderIdentifier: "" } : mintTxData);
        onClose();
    };

    useEffect(() => {
        // Clear any previous mint tx data when the modal is opened
        setMintTxData({ txHash: "", orderIdentifier: "" });
    }, []);

    useEffect(() => {
        if (!order?.orderId) return;  

        const { delivery } = order.lineItems[0];

        if (delivery?.status === "completed") {
            setMintTxData({
                txHash: delivery.txId,
                orderIdentifier: order.orderId,
            });
        }
    }, [order]);

    if (!isOpen) return null;

    const styles = {
        fontSizeBase: "0.91rem",
        fontWeightPrimary: "400",
        fontWeightSecondary: "500",
        //spacingUnit: "0.274rem",
        //borderRadius: "0px",
        colors: {
            background: "#140F0F",
            //backgroundSecondary: "#140F0F",
            backgroundTertiary: "#FF0030",
            textPrimary: "#A19F9F",
            textSecondary: "#F7F6F6",
            border: "#F7F6F6",
            danger: "#F97316",
            //textLink: "#F7F6F6",
            accent: "#FF0030",
        }
    }

    return (
        <div className="fixed inset-0 bg-nulnOil bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-nulnOil p-3 rounded-lg shadow-xl w-full max-w-3xl mx-4">
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-xl font-semibold text-white">{translate("actionSection.crossmintModalHeading")}</h2>
                    <button onClick={handleClose} className="text-white hover:text-gray-700">
                        <CloseIcon
                            width={15}
                            height={15}
                            fill="#fff"
                        />
                    </button>
                </div>
                <div className="p-4">
                <Suspense fallback={<div>{translate("actionSection.crossmintModalLoading")}</div>}>
                        <div className=" w-full">
                        <CrossmintEmbeddedCheckout
                            appearance={{
                                rules:{
                                    Label: {
                                        font:{
                                            size: styles.fontSizeBase,
                                            weight: styles.fontWeightPrimary,
                                        },
                                        colors:{
                                            text: styles.colors.textPrimary,
                                        },
                                    },  
                                    DestinationInput: {
                                        display: "hidden",
                                    },
                                    Input: {
                                        font:{
                                            size: styles.fontSizeBase,
                                            weight: styles.fontWeightPrimary,
                                        },
                                        colors:{
                                            text: styles.colors.textPrimary,
                                            border: styles.colors.border,
                                        },
                                    },
                                    PrimaryButton: {
                                        font:{
                                            size: styles.fontSizeBase,
                                            weight: styles.fontWeightSecondary,
                                        },
                                        colors:{
                                            background: styles.colors.backgroundTertiary,
                                            text: styles.colors.textSecondary,
                                        },
                                    },
                                },
                                variables: {
                                    colors: {
                                        backgroundPrimary: styles.colors.background,
                                        borderPrimary: styles.colors.border,
                                        warning: styles.colors.danger,
                                        textPrimary: styles.colors.textPrimary,
                                        textSecondary: styles.colors.textSecondary,
                                        danger: styles.colors.danger,
                                        accent: styles.colors.accent,                                
                                    },
                                },
                            }}
                            recipient={{
                                walletAddress: address as `0x${string}`
                            }}
                            lineItems={{
                                collectionLocator: `crossmint:${collectionId}`,   
                                callData: {
                                    _amount: totalQty,
                                    _to: address as `0x${string}`,
                                    _promoCode: promoCode,
                                    totalPrice: formatWeiToEther(totalPriceInETH, 18),
                                    // Left in here if we want to reenable crossmint crypto checkout using USDC
                                    // _expectedCostInUSDC: (BigInt(totalPriceInUsdc) / BigInt(10 ** 12)).toString(), // 10^12 to reduce 18 decimals to 6 decimals
                                    // totalPrice: formatWeiToEther(totalPriceInUsdc, 6), // convert to 6 decimal places for Crossmint
                            },
                            }}
                            payment={{
                                crypto: {
                                    enabled: true,
                                    defaultChain: "ethereum",
                                    defaultCurrency: "eth",                        
                                },
                                fiat: {
                                    enabled: true,
                                    allowedMethods: {
                                        card: true,
                                        googlePay: true,
                                        applePay: true,
                                    },
                                    defaultCurrency: "usd",
                                },
                            }}
                        />
                        </div>
                </Suspense>
                </div>
            </div>
        </div>
    );
};

export default CrossmintModal;