import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useNetwork, useContractWrite, Chain } from 'wagmi';
import { useGetTotalSupplyAndCap } from "@/features/checkout/hooks/useGetTotalSupplyAndCap";
import { useGetExchangeRate } from "@/features/checkout/hooks/useGetExchangeRate";
import { getEsXaiAllowance, getEsXaiBalance, getPromoCode, getXaiAllowance, getXaiBalance, config, CheckoutTierSummary, getWalletBalance, XaiAbi, NodeLicenseAbi } from "@sentry/core";
import { WriteContractResult } from 'wagmi/actions';

export interface PriceDataInterface {
    price: bigint;
    nodesAtEachPrice: Array<CheckoutTierSummary>;
}

interface UseWebBuyKeysOrderTotalProps {
    getPriceData: PriceDataInterface | undefined;
    discount: { applied: boolean, error: boolean };
    setDiscount: React.Dispatch<React.SetStateAction<{ applied: boolean, error: boolean }>>;
    promoCode: string;
    setPromoCode: React.Dispatch<React.SetStateAction<string>>;
    quantity: number;
}

interface UseWebBuyKeysOrderTotalReturn {
    isTotalLoading: boolean;
    isExchangeRateLoading: boolean;
    promo: boolean;
    setPromo: React.Dispatch<React.SetStateAction<boolean>>;
    checkboxOne: boolean;
    setCheckboxOne: React.Dispatch<React.SetStateAction<boolean>>;
    checkboxTwo: boolean;
    setCheckboxTwo: React.Dispatch<React.SetStateAction<boolean>>;
    checkboxThree: boolean;
    setCheckboxThree: React.Dispatch<React.SetStateAction<boolean>>;
    currency: string;
    setCurrency: React.Dispatch<React.SetStateAction<string>>;
    tokenBalance: bigint;
    ethBalance: bigint;
    tokenAllowance: bigint;
    ready: boolean;
    handleSubmit: () => Promise<void>;
    handleCurrencyChange: (newCurrency: string) => Promise<void>;
    calculateTotalPrice: () => bigint;
    getApproveButtonText: () => string;
    formatItemPricePer: (item: CheckoutTierSummary) => string;
    displayPricesMayVary: boolean;
    nodesAtEachPrice: Array<CheckoutTierSummary> | undefined;
    chain: Chain | undefined;
    discount: { applied: boolean, error: boolean };
    setDiscount: React.Dispatch<React.SetStateAction<{ applied: boolean, error: boolean }>>;
    promoCode: string;
    setPromoCode: React.Dispatch<React.SetStateAction<string>>;
    userHasTokenBalance: boolean;
    userHasEthBalance: boolean;
    userHasTokenAllowance: boolean;
    isLoadingMintWithEth: boolean;
    isSuccessMintWithEth: boolean;
    writeMintWithEth: () => void;
    errorMintWithEth: Error | null;
    isLoadingApprove: boolean;
    writeApprove: () => void;
    errorApprove: Error | null;
    isLoadingMintWithXai: boolean;
    isSuccessMintWithXai: boolean;
    writeMintWithXai: () => void;
    errorMintWithXai: Error | null;
    dataMintWithEth: WriteContractResult | undefined;
    dataMintWithXai: WriteContractResult | undefined;
    decimalPlaces: number;
}

export function useWebBuyKeysOrderTotal({
    getPriceData,
    discount,
    setDiscount,
    promoCode,
    setPromoCode,
    quantity
}: UseWebBuyKeysOrderTotalProps): UseWebBuyKeysOrderTotalReturn {
    const { isLoading: isTotalLoading } = useGetTotalSupplyAndCap();
    const { data: exchangeRateData, isLoading: isExchangeRateLoading } = useGetExchangeRate(); 
    const { chain } = useNetwork();
    const { address } = useAccount();

    const [promo, setPromo] = useState<boolean>(false);
    const [checkboxOne, setCheckboxOne] = useState<boolean>(false);
    const [checkboxTwo, setCheckboxTwo] = useState<boolean>(false);
    const [checkboxThree, setCheckboxThree] = useState<boolean>(false);
    const [currency, setCurrency] = useState<string>("AETH");
    const [tokenBalance, setTokenBalance] = useState<bigint>(0n);
    const [tokenAllowance, setTokenAllowance] = useState<bigint>(0n);
    const [ethBalance, setEthBalance] = useState<bigint>(0n);

    const ready = checkboxOne && checkboxTwo && checkboxThree;

    // Fetch user's ETH balance
    useEffect(() => {
        if (address) {
            const query = getWalletBalance(address);
            query.then((balance) => {
                setEthBalance(balance);
            });
        }
    }, [address]);

    // Fetch token balances and allowances based on selected currency
    useEffect(() => {
        handleCurrencyChange(currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currency, address]);

    // Handle promo code submission
    const handleSubmit = async () => {
        const validatePromoCode = await getPromoCode(promoCode);
        if (validatePromoCode.active) {
            setDiscount({ applied: true, error: false });
        } else {
            setDiscount({ applied: false, error: true });
            setPromoCode("");
        }
    };

    // Handle currency change and fetch respective balances and allowances
    const handleCurrencyChange = async (newCurrency: string) => {
        setCurrency(newCurrency);
        const walletAddress = address ? address : "";
        if (newCurrency === "AETH") {
            setTokenBalance(0n);
            setTokenAllowance(0n);
        } else if (newCurrency === "XAI") {
            const xaiBalance = getXaiBalance(walletAddress);
            const xaiAllowance = getXaiAllowance(walletAddress, config.nodeLicenseAddress);
            const promiseAll = await Promise.all([xaiBalance, xaiAllowance]);
            setTokenBalance(promiseAll[0].balance);
            setTokenAllowance(promiseAll[1].approvalAmount);
        } else {
            const esxaiBalance = getEsXaiBalance(walletAddress);
            const esxaiAllowance = getEsXaiAllowance(walletAddress, config.nodeLicenseAddress);
            const promiseAll = await Promise.all([esxaiBalance, esxaiAllowance]);
            setTokenBalance(promiseAll[0].balance);
            setTokenAllowance(promiseAll[1].approvalAmount);
        }
    };

    // Calculate total price based on selected currency
    const calculateTotalPrice = (): bigint => {
        let price = 0n;
        if (currency === "AETH") {
            price = _calculateAethTotal();
        } else {
            price = _calculateXaiTotal();
        }
        return price;
    };

    // Helper function to calculate total price in AETH
    const _calculateAethTotal = (): bigint => {
        const price = getPriceData?.price ?? 0n;
        if (discount.applied) {
            return price * BigInt(95) / BigInt(100);
        }
        return price;
    };

    // Helper function to calculate total price in XAI or esXai
    const _calculateXaiTotal = (): bigint => {
        const totalEthPrice = _calculateAethTotal();
        const exchangeRate = exchangeRateData?.exchangeRate ?? 0n;
        return totalEthPrice * exchangeRate;
    };

    // Get appropriate button text based on balances and allowances
    const getApproveButtonText = (): string => {
        const xaiTotal = _calculateXaiTotal();
        if (xaiTotal > tokenBalance) {
            return `Insufficient ${currency} balance`;
        }
        if (xaiTotal > tokenAllowance) {
            return `Approve ${currency}`;
        }
        return "BUY NOW";
    };

    // Format item price per key
    const formatItemPricePer = (item: CheckoutTierSummary): string => {
        if (currency === "AETH") {
            return ethers.formatEther(item.pricePer);
        }
        const exchangeRate = exchangeRateData?.exchangeRate ?? 0n;
        return ethers.formatEther(item.pricePer * exchangeRate);
    };

    // Check if user has enough token balance and allowance
    const userHasTokenBalance = tokenBalance >= _calculateXaiTotal();
    const userHasTokenAllowance = tokenAllowance >= _calculateXaiTotal();
    const userHasEthBalance = ethBalance >= _calculateAethTotal();

    // Check if prices may vary
    const displayPricesMayVary = (getPriceData?.nodesAtEachPrice?.filter((node) => node.quantity !== 0n) ?? []).length >= 2;

    const useEsXai = currency === "esXai";
    const tokenAddress = useEsXai ? config.esXaiAddress : config.xaiAddress;
    const spender = config.nodeLicenseAddress as `0x${string}`;
    const allowanceAmount = ethers.MaxUint256.toString();

    // Contract write hooks for minting with ETH, approving token, and minting with XAI
    const { isLoading: isLoadingMintWithEth, isSuccess: isSuccessMintWithEth, write: writeMintWithEth, error: errorMintWithEth, data: dataMintWithEth } = useContractWrite({
        address: config.nodeLicenseAddress as `0x${string}`,
        abi: NodeLicenseAbi,
        functionName: "mint",
        args: [quantity, promoCode],
        value: getPriceData && discount.applied ? getPriceData.price * BigInt(95) / BigInt(100) : getPriceData?.price,
        onError(error) {
            console.warn("Error", error);
        },
    });

    const { isLoading: isLoadingApprove, write: writeApprove, error: errorApprove } = useContractWrite({
        address: tokenAddress as `0x${string}`,
        abi: XaiAbi,
        functionName: "approve",
        args: [spender, allowanceAmount],
        onError(error) {
            console.warn("Error", error);
        },
    });

    const { isLoading: isLoadingMintWithXai, isSuccess: isSuccessMintWithXai, write: writeMintWithXai, error: errorMintWithXai, data: dataMintWithXai } = useContractWrite({
        address: config.nodeLicenseAddress as `0x${string}`,
        abi: NodeLicenseAbi,
        functionName: "mintWithXai",
        args: [quantity, promoCode, useEsXai, calculateTotalPrice()],
        onError(error) {
            console.warn("Error", error);
        },
    });

    function determineDecimalPlaces(): number {
        if (currency === "AETH") {
            return 9;
        }
        return 2;        
    }

    return {
        isTotalLoading,
        isExchangeRateLoading,
        promo,
        setPromo,
        checkboxOne,
        setCheckboxOne,
        checkboxTwo,
        setCheckboxTwo,
        checkboxThree,
        setCheckboxThree,
        currency,
        setCurrency,
        ethBalance,
        tokenBalance,
        tokenAllowance,
        ready,
        handleSubmit,
        handleCurrencyChange,
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
        isLoadingMintWithEth,
        isSuccessMintWithEth,
        writeMintWithEth,
        errorMintWithEth,
        isLoadingApprove,
        writeApprove,
        errorApprove,
        isLoadingMintWithXai,
        isSuccessMintWithXai,
        writeMintWithXai,
        errorMintWithXai,
        dataMintWithEth,
        dataMintWithXai,
        decimalPlaces: determineDecimalPlaces(),
    };
}
