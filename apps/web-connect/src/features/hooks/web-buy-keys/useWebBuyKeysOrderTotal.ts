import { useState, useMemo, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckoutTierSummary, formatWeiToEther, isValidNetwork } from '@sentry/core';
import { CURRENCIES, Currency, useContractWrites, UseContractWritesReturn, useCurrencyHandler, useGetExchangeRate, useGetPriceForQuantity, useGetTotalSupplyAndCap, usePromoCodeHandler, useUserBalances } from '..';
import { useProvider } from "../provider/useProvider";
import { useNetworkConfig } from '@/hooks/useNetworkConfig';

export interface PriceDataInterface {
    price: bigint;
    nodesAtEachPrice: Array<CheckoutTierSummary>;
}

export interface UseWebBuyKeysOrderTotalProps {
    initialQuantity: number;
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
    getEthButtonText: () => string;
    formatItemPricePer: (item: CheckoutTierSummary) => string;
    displayPricesMayVary: boolean;
    nodesAtEachPrice: Array<CheckoutTierSummary> | undefined;
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
    address: `0x${string}` | undefined;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    handleApplyPromoCode: () => Promise<void>;
    approve: UseContractWritesReturn['approve'];
    mintWithEth: UseContractWritesReturn['mintWithEth'];
    mintWithXai: UseContractWritesReturn['mintWithXai'];
    mintWithUsdc: UseContractWritesReturn['mintWithUsdc'];
    approveTx: ReturnType<typeof useWaitForTransactionReceipt>;
    ethMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
    xaiMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
    blockExplorer: string;
    handleMintWithEthClicked: () => void;
    handleApproveClicked: () => void;
    handleMintWithTokenClicked: () => void;
    chainId: number | undefined;
    isConnected: boolean;
    crossmintOpen: boolean;
    setCrossmintOpen: (open: boolean) => void;
}

/**
 * Custom hook to manage the state and logic for the web buy keys order total.
 * @param initialQuantity - The initial quantity of items to mint.
 * @returns An object containing various properties and functions related to the order total.
 */
export function useWebBuyKeysOrderTotal(initialQuantity: number): UseWebBuyKeysOrderTotalReturn {

    const [crossmintOpen, setCrossmintOpen] = useState(false);
    const [currency, setCurrency] = useState<Currency>(CURRENCIES.AETH);
    const { isLoading: isTotalLoading, data: getTotalData } = useGetTotalSupplyAndCap();
    const { data: exchangeRateData, isLoading: isExchangeRateLoading } = useGetExchangeRate(currency);
    const { chainId, isConnected, address, isDevelopment } = useNetworkConfig();

    const { data: providerData } = useProvider();

    const maxSupply = getTotalData?.cap && getTotalData?.totalSupply
        ? Number(getTotalData.cap) - Number(getTotalData.totalSupply)
        : 0;

    const [checkboxes, setCheckboxes] = useState({
        one: false,
        two: false,
        three: false,
    });
    const [quantity, setQuantity] = useState<number>(initialQuantity);
    const { tokenBalance, ethBalance } = useUserBalances(currency);
    const { tokenAllowance, refetchAllowance } = useCurrencyHandler(currency, address);
    const { promoCode, setPromoCode, discount, setDiscount, handleApplyPromoCode, isLoading: isPromoLoading } = usePromoCodeHandler(address);

    const ready = checkboxes.one && checkboxes.two && checkboxes.three;

    const decimalPlaces: number = currency === CURRENCIES.AETH ? 9 : 2;

    const { data: getPriceData, isLoading: isPriceLoading } = useGetPriceForQuantity(quantity);
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
            if(currency === CURRENCIES.USDC) {
                const exRate = exchangeRateData?.exchangeRate ?? 0n;
                const usdcAdjustedExRate = BigInt(exRate / BigInt(10 ** 18)); // Remove decimals from exchange rate
                const usdcPrice18Decimals = discountedPrice * usdcAdjustedExRate; // Calculate price in 18 decimals
                return usdcPrice18Decimals;
            }
            const exchangeRate = exchangeRateData?.exchangeRate ?? 0n;
            return discountedPrice * exchangeRate;
        };
    }, [getPriceData, discount, currency, exchangeRateData]);


    const {
        mintWithEth,
        approve,
        mintWithXai,
        mintWithUsdc,
        ethMintTx,
        xaiMintTx,
        usdcMintTx,
        approveTx,
        clearErrors,
        resetTransactions,
        mintWithEthError,
        handleMintWithEthClicked,
        handleApproveClicked,
        handleMintWithTokenClicked,
    } = useContractWrites({
        quantity,
        promoCode,
        calculateTotalPrice,
        currency,
        discount,
    });

    useEffect(() => {
        refetchAllowance();
    }, [approveTx.status, refetchAllowance]);


    useEffect(() => {
        clearErrors();
        resetTransactions();
    }, [currency]);

    /**
     * Determines the text to display on the approve button based on the current state.
     * @returns The approve button text as a string.
     */
    const getApproveButtonText = (): string => {
        const total = calculateTotalPrice();

        if (approve.isPending || xaiMintTx.isLoading || usdcMintTx.isLoading) {
            return "WAITING FOR CONFIRMATION...";
        }

        if (total > tokenBalance) {
            return `Insufficient ${currency} balance`;
        }

        if (total > tokenAllowance) {
            return `Approve ${currency}`;
        }

        return "PURCHASE NOW";
    };

    const getEthButtonText = (): string => {
        if (!isConnected) return "Please Connect Wallet";
        if (!isValidNetwork(chainId, isDevelopment)) return "Please Switch to Arbitrum";
        if (mintWithEth.isPending || ethMintTx.isLoading) {
            return "WAITING FOR CONFIRMATION...";
        }

        if (calculateTotalPrice() > ethBalance) {
            return "Insufficient ETH balance";
        }

        return "MINT NOW";
    };

    /**
     * Formats the price per item based on the currency and exchange rate.
     * @param item - The item to format the price for.
     * @returns The formatted price as a string.
     */
    const formatItemPricePer = (item: CheckoutTierSummary): string => {
        let price;
        switch (currency) {
            case CURRENCIES.AETH:
                price = item.pricePer;
                break;
            case CURRENCIES.USDC:
                price = item.pricePer * (exchangeRateData?.exchangeRate ?? 0n) / BigInt(10 ** 18);
                break;
            default:
                price = item.pricePer * (exchangeRateData?.exchangeRate ?? 0n);
        }
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
        getEthButtonText,
        formatItemPricePer,
        displayPricesMayVary,
        nodesAtEachPrice: getPriceData?.nodesAtEachPrice,
        //chain,
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
        handleApplyPromoCode,
        mintWithEth,
        approve,
        mintWithXai,
        mintWithUsdc,
        ethMintTx,
        xaiMintTx,
        usdcMintTx,
        approveTx,
        address,
        clearErrors,
        resetTransactions,
        mintWithEthError,
        blockExplorer: providerData?.blockExplorer ?? '',
        handleMintWithEthClicked,
        handleApproveClicked,
        handleMintWithTokenClicked,
        chainId,
        isConnected,
        crossmintOpen,
        setCrossmintOpen,
    };
}