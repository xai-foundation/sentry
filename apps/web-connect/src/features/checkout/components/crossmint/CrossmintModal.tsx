import React, { Suspense } from 'react';
import { useAccount } from 'wagmi';
import { config, formatWeiToEther } from "@sentry/core";
import { CloseIcon } from "@sentry/ui";
import {
  CrossmintProvider,
  CrossmintEmbeddedCheckout,
} from "@crossmint/client-sdk-react-ui";

interface CrossmintModalProps {
    isOpen: boolean;
    totalQty: number;
    totalPriceInUsdc: string;
    promoCode: string;
    onClose: () => void;
}

const CrossmintModal: React.FC<CrossmintModalProps> = ({ isOpen, onClose, totalPriceInUsdc, totalQty, promoCode }) => {
    const collectionId = config.crossmintCollectionId;
    const clientApiKey = config.crossmintClientApiKey;
    const { address } = useAccount();

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
                    <h2 className="text-xl font-semibold text-white">Pay with Credit Card</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-700">
                        <CloseIcon
                            width={15}
                            height={15}
                            fill="#fff"
                        />
                    </button>
                </div>
                <div className="p-4">
                    
                <Suspense fallback={<div>Loading...</div>}>
                    <CrossmintProvider apiKey={clientApiKey}>
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
                                _expectedCostInUSDC: (BigInt(totalPriceInUsdc) / BigInt(10 ** 12)).toString(), // 10^12 to reduce 18 decimals to 6 decimals
                                totalPrice:formatWeiToEther(totalPriceInUsdc, 4), // convert to 4 decimal places for Crossmint
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
                                },
                                defaultCurrency: "usd",
                            },
                            }}
                        />
                        </div>
                    </CrossmintProvider>
                </Suspense>
                </div>
            </div>
        </div>
    );
};

export default CrossmintModal;