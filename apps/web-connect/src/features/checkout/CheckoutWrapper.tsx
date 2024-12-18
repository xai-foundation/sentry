import { WebBuyKeysProvider } from './contexts/WebBuyKeysContext';
import { Checkout } from './Checkout';

export function CheckoutWrapper() {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const prefilledAmount = queryParams.get("quantity") ? parseInt(queryParams.get("quantity") as string) : 10;
    const prefilledPromoCode = queryParams.get("promoCode");

    return (
        <WebBuyKeysProvider initialQuantity={prefilledAmount} prefilledPromoCode={prefilledPromoCode || ""}>
            <Checkout />
        </WebBuyKeysProvider>
    );
}
