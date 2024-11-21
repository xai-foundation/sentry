import { useState, useMemo, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { CheckoutTierSummary, formatWeiToEther, isValidNetwork } from '@sentry/core';
import { CURRENCIES, Currency, useContractWrites, UseContractWritesReturn, useCurrencyHandler, useGetExchangeRate, useGetPriceForQuantity, useGetTotalSupplyAndCap, usePromoCodeHandler, useUserBalances } from '..';
import { useProvider } from "../provider/useProvider";
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { useCrossmintEvents } from '@crossmint/client-sdk-base';
import {ethers} from 'ethers';

export interface PriceDataInterface {
    price: bigint;
    nodesAtEachPrice: Array<CheckoutTierSummary>;
}

export interface UseWebBuyKeysOrderTotalProps {
    initialQuantity: number;
}

interface MintWithCrossmintStatus {
    txHash: string,
    error: string,
    isPending: boolean,
    orderIdentifier: string
}

export interface UseWebBuyKeysOrderTotalReturn extends UseContractWritesReturn {
    isTotalLoading: boolean;
    isExchangeRateLoading: boolean;
    isUsdExchangeRateLoading: boolean;
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
    approveTx: ReturnType<typeof useWaitForTransactionReceipt>;
    ethMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
    xaiMintTx: ReturnType<typeof useWaitForTransactionReceipt>;
    blockExplorer: string;
    handleMintWithEthClicked: () => void;
    handleApproveClicked: () => void;
    handleMintWithXaiClicked: () => void;
    chainId: number | undefined;
    isConnected: boolean;
    mintWithCrossmint: MintWithCrossmintStatus
    setMintWithCrossmint: React.Dispatch<React.SetStateAction<MintWithCrossmintStatus>>
}

/**
 * Custom hook to manage the state and logic for the web buy keys order total.
 * @param initialQuantity - The initial quantity of items to mint.
 * @returns An object containing various properties and functions related to the order total.
 */
export function useWebBuyKeysOrderTotal(initialQuantity: number): UseWebBuyKeysOrderTotalReturn {
    const { VITE_APP_ENV } = import.meta.env
    const environment = VITE_APP_ENV === 'development' ? 'staging' : 'production';
    const { listenToMintingEvents } = useCrossmintEvents({
        environment: environment,
    });

    const { isLoading: isTotalLoading, data: getTotalData } = useGetTotalSupplyAndCap();
    const { data: exchangeRateData, isLoading: isExchangeRateLoading } = useGetExchangeRate("XAI");
    const { data: usdExchangeRateData, isLoading: isUsdExchangeRateLoading } = useGetExchangeRate("USD");
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
    const [currency, setCurrency] = useState<Currency>(CURRENCIES.AETH);
    const [quantity, setQuantity] = useState<number>(initialQuantity);
    const [mintWithCrossmint, setMintWithCrossmint] = useState<MintWithCrossmintStatus>({
        txHash: "",
        error: "",
        orderIdentifier: "",
        isPending: false
    });

    const { tokenBalance, ethBalance } = useUserBalances(currency);
    const { tokenAllowance, refetchAllowance } = useCurrencyHandler(currency, address);
    const { promoCode, setPromoCode, discount, setDiscount, handleApplyPromoCode, isLoading: isPromoLoading } = usePromoCodeHandler(address);

    const ready = checkboxes.one && checkboxes.two && checkboxes.three;

    let decimalPlaces: number;
    switch (currency) {
        case CURRENCIES.AETH:
            decimalPlaces = 9;
            break;
        case CURRENCIES.XAI:
            decimalPlaces = 2;
            break;
        case CURRENCIES.ES_XAI:
            decimalPlaces = 2;
            break;
        case CURRENCIES.USDC:
            decimalPlaces = 2;
            break;
        default:
            console.log(`unsupported currency: ${currency}`);
            decimalPlaces = 18;
            // throw new Error(`unsupported currency: ${currency}`);
    }

    const { data: getPriceData, isLoading: isPriceLoading } = useGetPriceForQuantity(quantity);
    // Retrieve price data for the specified quantity

    /**
     * Calculates the total price based on the price data, discount, and currency.
     * @returns The total price as a bigint.
     */
    const calculateTotalPrice = useMemo(() => {
        return () => {
            const price = getPriceData?.price ?? 0n; //returns price for node license in wei
            const discountedPrice = discount.applied ? price * BigInt(95) / BigInt(100) : price;
            let exchangeRate: bigint;
            switch (currency) {
                case CURRENCIES.AETH:
                    return discountedPrice;
                case CURRENCIES.XAI:
                    exchangeRate = exchangeRateData?.exchangeRate ?? 0n;
                    break;
                case CURRENCIES.ES_XAI:
                    exchangeRate = exchangeRateData?.exchangeRate ?? 0n;
                    break;
                case CURRENCIES.USDC:
                    exchangeRate = usdExchangeRateData?.exchangeRate ?? 0n;
                    break;
                default:
                    exchangeRate = BigInt(0);
                    console.log(`Unsupported currency: ${currency}`);
                    // throw new Error(`Unsupported currency: ${currency}`);
            }
            return discountedPrice * exchangeRate;
        };
    }, [getPriceData, discount, currency, exchangeRateData]);

    const {
        mintWithEth,
        approve,
        mintWithXai,
        ethMintTx,
        xaiMintTx,
        approveTx,
        clearErrors,
        resetTransactions,
        mintWithEthError,
        handleMintWithEthClicked,
        handleApproveClicked,
        handleMintWithXaiClicked,
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

        if (approve.isPending || xaiMintTx.isLoading) {
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
        let price: bigint;
        switch (currency) {
            case CURRENCIES.AETH:
                price = item.pricePer;
                return formatWeiToEther(price, decimalPlaces);
            case CURRENCIES.XAI:
                price = item.pricePer * (exchangeRateData?.exchangeRate ?? 0n);
                return formatWeiToEther(price, decimalPlaces);
            case CURRENCIES.ES_XAI:
                price = item.pricePer * (exchangeRateData?.exchangeRate ?? 0n);
                return formatWeiToEther(price, decimalPlaces);
            case CURRENCIES.USDC:
                price = item.pricePer * (usdExchangeRateData?.exchangeRate ?? 0n);
                const priceAdjusted = price / BigInt(1e20);
                const formatted = ethers.formatUnits(priceAdjusted, 6);
                console.log(`>>> priceAdjusted: ${priceAdjusted} formatted: ${formatted}`);
                return formatted;
            default:
                price = BigInt(0);
                console.log(`Unsupported currency: ${currency}`);
                // throw new Error(`Unsupported currency: ${currency}`);
        }
        return "";
    };

    const userHasTokenBalance = tokenBalance >= calculateTotalPrice();
    const userHasTokenAllowance = tokenAllowance >= calculateTotalPrice();
    const userHasEthBalance = ethBalance >= calculateTotalPrice();

    const displayPricesMayVary = (getPriceData?.nodesAtEachPrice?.filter((node: CheckoutTierSummary) => node.quantity !== 0n) ?? []).length >= 2;

    useEffect(() => {
        if (mintWithCrossmint.orderIdentifier != "") {
            const eventListener = listenToMintingEvents({ orderIdentifier: mintWithCrossmint.orderIdentifier }, (event) => {
                switch (event.type) {
                    case "transaction:fulfillment.succeeded":
                        setMintWithCrossmint({ isPending: false, txHash: event.payload.txId, error: "", orderIdentifier: "" });
                        break;
                    case "transaction:fulfillment.failed":
                        console.error("Crossmint CC Error:", event.payload, event.payload.error.message)
                        setMintWithCrossmint({ isPending: false, error: event.payload.error.message, txHash: "", orderIdentifier: "" });
                        break;
                }
            });

            // Clean up the event listener when the component unmounts or status changes
            return () => {
                if (eventListener && typeof eventListener.cleanup === 'function') {
                    eventListener.cleanup();
                }
            };
        }
    }, [mintWithCrossmint.orderIdentifier, listenToMintingEvents]);

    return {
        isTotalLoading,
        isExchangeRateLoading,
        isUsdExchangeRateLoading,
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
        ethMintTx,
        xaiMintTx,
        approveTx,
        address,
        clearErrors,
        resetTransactions,
        mintWithEthError,
        blockExplorer: providerData?.blockExplorer ?? '',
        handleMintWithEthClicked,
        handleApproveClicked,
        handleMintWithXaiClicked,
        chainId,
        isConnected,
        mintWithCrossmint,
        setMintWithCrossmint
    };
}