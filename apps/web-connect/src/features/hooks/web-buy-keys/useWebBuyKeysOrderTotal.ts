import { useState, useMemo } from 'react';
import { useAccount, useNetwork, Chain } from 'wagmi';
import { CheckoutTierSummary, formatWeiToEther } from '@sentry/core';
import { CURRENCIES, Currency, UseContractWritesReturn, useContractWrites, useCurrencyHandler, useGetExchangeRate, useGetPriceForQuantity, useGetTotalSupplyAndCap, usePromoCodeHandler, useUserBalances } from '..';

export interface PriceDataInterface {
    price: bigint;
    nodesAtEachPrice: Array<CheckoutTierSummary>;
}

export interface UseWebBuyKeysOrderTotalProps {
    initialQuantity: number;
    //getPriceData: PriceDataInterface | undefined;
}

export interface UseWebBuyKeysOrderTotalReturn extends UseContractWritesReturn {
    isTotalLoading: boolean;
    isExchangeRateLoading: boolean;
    isPromoLoading: boolean;
    isPriceLoading: boolean;
    checkboxes: {
        one: boolean;
        two: boolean;
        three: boolean;
    };
    setCheckboxes: React.Dispatch<React.SetStateAction<{
        one: boolean;
        two: boolean;
        three: boolean;
    }>>;
    currency: Currency;
    setCurrency: React.Dispatch<React.SetStateAction<Currency>>;
    ethBalance: bigint;
    tokenBalance: bigint;
    tokenAllowance: bigint;
    ready: boolean;
    calculateTotalPrice: () => bigint;
    getApproveButtonText: () => string;
    formatItemPricePer: (item: CheckoutTierSummary) => string;
    displayPricesMayVary: boolean;
    nodesAtEachPrice: Array<CheckoutTierSummary> | undefined;
    chain: Chain | undefined;
    discount: { applied: boolean; error: boolean };
    setDiscount: React.Dispatch<React.SetStateAction<{ applied: boolean; error: boolean }>>;
    promoCode: string;
    setPromoCode: React.Dispatch<React.SetStateAction<string>>;
    userHasTokenBalance: boolean;
    userHasEthBalance: boolean;
    userHasTokenAllowance: boolean;
    decimalPlaces: number;
    quantity: number;
    maxSupply: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    handleSubmit: () => Promise<void>;
}

export function useWebBuyKeysOrderTotal(initialQuantity: number): UseWebBuyKeysOrderTotalReturn {
    const { isLoading: isTotalLoading, data: getTotalData } = useGetTotalSupplyAndCap();
    const { data: exchangeRateData, isLoading: isExchangeRateLoading } = useGetExchangeRate();
    const { chain } = useNetwork();
    const { address } = useAccount();

    const maxSupply = getTotalData?.cap && getTotalData?.totalSupply
        ? Number(getTotalData.cap) - Number(getTotalData.totalSupply)
        : 0;

    const [checkboxes, setCheckboxes] = useState({
        one: false,
        two: false,
        three: false,
    });
    const [currency, setCurrency] = useState<Currency>(CURRENCIES.AETH);
    const [quantity, setQuantity] = useState<number>(initialQuantity);

    const { tokenBalance, ethBalance } = useUserBalances(currency);
    const { tokenAllowance } = useCurrencyHandler(currency, address);
    const { promoCode, setPromoCode, discount, setDiscount, handleSubmit, isLoading: isPromoLoading } = usePromoCodeHandler();

    const ready = checkboxes.one && checkboxes.two && checkboxes.three;

    const  decimalPlaces: number = currency  === CURRENCIES.AETH ? 9 : 2;

    const { data: getPriceData, isLoading: isPriceLoading   } = useGetPriceForQuantity(quantity);
    // Retrieve price data for the specified quantity

    /**
     * Calculates the total price based on the price data, discount, and currency.
     * @returns The total price as a bigint.
     */
    const calculateTotalPrice = useMemo(() => {
        return () => {
            const price = getPriceData?.price ?? 0n;
            const discountedPrice = discount.applied ? price * BigInt(95) / BigInt(100) : price;
            if (currency === CURRENCIES.AETH) {
                return discountedPrice;
            }
            const exchangeRate = exchangeRateData?.exchangeRate ?? 0n;
            return discountedPrice * exchangeRate;
        };
    }, [getPriceData, discount, currency, exchangeRateData]);

    const contractWrites = useContractWrites({
        quantity,
        promoCode,
        calculateTotalPrice,
        currency,
        discount,
    });

    /**
     * Gets the text for the approve button based on the user's balance and allowance.
     * @returns The approve button text as a string.
     */
    const getApproveButtonText = (): string => {
        const total = calculateTotalPrice();
        if (total > tokenBalance) {
            return `Insufficient ${currency} balance`;
        }
        if (total > tokenAllowance) {
            return `Approve ${currency}`;
        }
        return "BUY NOW";
    };

    /**
     * Formats the price per item based on the currency and exchange rate.
     * @param item - The item to format the price for.
     * @returns The formatted price as a string.
     */
    const formatItemPricePer = (item: CheckoutTierSummary): string => {
        const price = currency === CURRENCIES.AETH
            ? item.pricePer
            : item.pricePer * (exchangeRateData?.exchangeRate ?? 0n);
        return formatWeiToEther(price, decimalPlaces);
    };

    const userHasTokenBalance = tokenBalance >= calculateTotalPrice();
    const userHasTokenAllowance = tokenAllowance >= calculateTotalPrice();
    const userHasEthBalance = ethBalance >= calculateTotalPrice();

    const displayPricesMayVary = (getPriceData?.nodesAtEachPrice?.filter((node: CheckoutTierSummary) => node.quantity !== 0n) ?? []).length >= 2;

    return {
        isTotalLoading,
        isExchangeRateLoading,
        isPriceLoading,
        isPromoLoading,
        checkboxes,
        setCheckboxes,
        currency,
        setCurrency,
        ethBalance,
        tokenBalance,
        tokenAllowance,
        ready,
        calculateTotalPrice,
        getApproveButtonText,
        formatItemPricePer,
        displayPricesMayVary,
        nodesAtEachPrice: getPriceData?.nodesAtEachPrice,
        chain,
        discount,
        setDiscount,
        promoCode,
        setPromoCode,
        userHasTokenBalance,
        userHasEthBalance,
        userHasTokenAllowance,
        decimalPlaces,
        quantity,
        maxSupply,
        setQuantity,
        handleSubmit,
        ...contractWrites,
    };
}
