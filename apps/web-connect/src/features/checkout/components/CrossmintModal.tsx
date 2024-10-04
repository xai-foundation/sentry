import { CrossmintPaymentElement } from '@crossmint/client-sdk-react-ui';
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Minting from './Minting';
import {config} from "@sentry/core";

interface CrossmintModalProps {
    isOpen: boolean;
    totalQty: number;
    totalPriceInEth: string;
    promoCode: string;
    onClose: () => void;
}

const CrossmintModal: React.FC<CrossmintModalProps> = ({ isOpen, onClose, totalPriceInEth, totalQty, promoCode }) => {
	const { VITE_APP_ENV } = import.meta.env
    const [orderIdentifier, setOrderIdentifier] = useState<string | null>(null);
    const { address } = useAccount();
    const recipient = {
        wallet: address
    }
    if (!isOpen) return null;

    const projectId = config.crossmintProjectId;
    const collectionId = config.crossmintCollectionId;
    const environment = VITE_APP_ENV  === 'development' ? 'staging' : 'production';

    const styles = {
      fontSizeBase: "0.91rem",
      fontWeightPrimary: "400",
      fontWeightSecondary: "500",
      spacingUnit: "0.274rem",
      borderRadius: "0px",
      colors: {
        background: "#140F0F",
        backgroundSecondary: "#140F0F",
        backgroundTertiary: "#FF0030",
        textPrimary: "#A19F9F",
        textSecondary: "#F7F6F6",
        border: "#F7F6F6",
        danger: "#F97316",
        textLink: "#F7F6F6",
      }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-black p-3 rounded-lg shadow-xl w-full max-w-3xl mx-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold text-white">Pay with Credit Card</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        X
                    </button>
                </div>
                <div className="p-4">
                    {orderIdentifier !== null ? <Minting orderIdentifier={orderIdentifier}/> :
                        <div>
                            <CrossmintPaymentElement
                                projectId={projectId}
                                collectionId={collectionId}
                                environment={environment}
                                recipient={recipient}
                                uiConfig={styles}
                                mintConfig={{
                                    type: "erc-721",
                                    totalPrice: totalPriceInEth,
                                    currency: "ETH",
                                    _mintToAddress: address,
                                    _amount: totalQty.toString(),
                                    _promoCode: promoCode
                                }}
                                onEvent={(event) => {
                                    switch (event.type) {
                                        case "payment:process.succeeded":
                                            setOrderIdentifier(event.payload.orderIdentifier);
                                            break;
                                    }
                                }}
                            />
                        </div>}
                </div>
            </div>
        </div>
    );
};

export default CrossmintModal;