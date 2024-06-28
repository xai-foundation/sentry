import { useWebBuyKeysOrderTotal, UseWebBuyKeysOrderTotalReturn } from '@/features/hooks';
import React, { createContext, ReactNode } from 'react';

interface WebBuyKeysProviderProps {
    children: ReactNode;
    initialQuantity: number;
}

export const WebBuyKeysContext = createContext<UseWebBuyKeysOrderTotalReturn | null>(null);

export const WebBuyKeysProvider: React.FC<WebBuyKeysProviderProps> = ({ children, initialQuantity }) => {
    const hookData = useWebBuyKeysOrderTotal(initialQuantity);

    return (
        <WebBuyKeysContext.Provider value={hookData}>
            {children}
        </WebBuyKeysContext.Provider>
    );
};
