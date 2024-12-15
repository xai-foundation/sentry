import { useState, useCallback } from 'react';
import { getPromoCode } from "@sentry/core";
import { useTranslation } from 'react-i18next';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';

interface DiscountState {
  applied: boolean;
  error: boolean;
  errorMessage: string | undefined; // Optional error message
}

interface PromoCodeValidationResponse {
  active: boolean;
  recipient: string;
}

/**
 * Custom hook to handle promo code validation.
 * Manages promo code input, discount state, and loading state.
 * @returns An object containing the promo code, discount state, handleApplyPromoCode function, and loading state.
 */
export function usePromoCodeHandler(address:`0x${string}` | undefined) {
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<DiscountState>({ applied: false, error: false, errorMessage: undefined });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isConnected } = useNetworkConfig();
  const { t: translate } = useTranslation("Checkout");

  /**
   * Handles the submission of the promo code.
   * Validates the promo code and updates the discount state accordingly.
   */
  const handleApplyPromoCode = useCallback(async () => {
    if(!isConnected){
      setDiscount({ applied: false, error: true, errorMessage: undefined });
      setPromoCode("");
      return;
    }

    if(promoCode === ""){
      setDiscount({ applied: false, error: true, errorMessage: undefined });
      return;
    }
    setIsLoading(true);
    try {
      const validatePromoCode: PromoCodeValidationResponse = await getPromoCode(promoCode);
      
      if(address && address.toLowerCase() === validatePromoCode.recipient.toLowerCase()){
        setDiscount({ applied: false, error: true, errorMessage: "promoCodeRow.noDiscount.noSelfPromoCode" }); // "You are unable to use your own promo code"
        return;
      }

      const addressIsRecipient = validatePromoCode.recipient && validatePromoCode.recipient.toLowerCase() === address?.toLowerCase();
      let  errorMessage = !validatePromoCode.active ? "promoCodeRow.noDiscount.promoCodeInvalid" : undefined;
      if(addressIsRecipient){
        validatePromoCode.active = false;
        errorMessage = translate("promoCodeRow.noDiscount.noSelfPromoCode"); // You are unable to use your own promo code
      }
      
      setDiscount({
        applied: validatePromoCode.active,
        error: !validatePromoCode.active,
        errorMessage: errorMessage,
      });
      // if (!validatePromoCode.active) setPromoCode("");
    } catch (error) {
      console.error("Error validating promo code:", error);
      setDiscount({ applied: false, error: true, errorMessage: "promoCodeRow.noDiscount.promoCodeError" });
    } finally {
      setIsLoading(false);
    }
  }, [promoCode, address]);

  return { promoCode, setPromoCode, discount, setDiscount, handleApplyPromoCode, isLoading };
}
