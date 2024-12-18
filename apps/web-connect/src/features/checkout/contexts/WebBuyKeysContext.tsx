import { useWebBuyKeysOrderTotal, UseWebBuyKeysOrderTotalReturn } from '@/features/hooks';
import React, { createContext, ReactNode } from 'react';

interface WebBuyKeysProviderProps {
    children: ReactNode;
    initialQuantity: number;
    prefilledPromoCode: string;
}

export const WebBuyKeysContext = createContext<UseWebBuyKeysOrderTotalReturn | null>(null);

export const WebBuyKeysProvider: React.FC<WebBuyKeysProviderProps> = ({ children, initialQuantity, prefilledPromoCode }) => {
    const hookData = useWebBuyKeysOrderTotal(initialQuantity, prefilledPromoCode);

    return (
        <WebBuyKeysContext.Provider value={hookData}>
            {children}
        </WebBuyKeysContext.Provider>
    );
};
