import { useState, useCallback } from 'react';
import { getPromoCode } from "@sentry/core";

interface DiscountState {
  applied: boolean;
  error: boolean;
  errorMessage?: string; // Optional error message
}

interface PromoCodeValidationResponse {
  active: boolean;
}

/**
 * Custom hook to handle promo code validation.
 * Manages promo code input, discount state, and loading state.
 * @returns An object containing the promo code, discount state, handleSubmit function, and loading state.
 */
export function usePromoCodeHandler() {
  const [promoCode, setPromoCode] = useState<string>("");
  const [discount, setDiscount] = useState<DiscountState>({ applied: false, error: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Handles the submission of the promo code.
   * Validates the promo code and updates the discount state accordingly.
   */
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const validatePromoCode: PromoCodeValidationResponse = await getPromoCode(promoCode);
      setDiscount({
        applied: validatePromoCode.active,
        error: !validatePromoCode.active,
        errorMessage: !validatePromoCode.active ? "Promo code is invalid or inactive." : undefined,
      });
      if (!validatePromoCode.active) setPromoCode("");
    } catch (error) {
      console.error("Error validating promo code:", error);
      setDiscount({ applied: false, error: true, errorMessage: "An error occurred while validating the promo code." });
    } finally {
      setIsLoading(false);
    }
  }, [promoCode]);

  return { promoCode, setPromoCode, discount, setDiscount, handleSubmit, isLoading };
}
