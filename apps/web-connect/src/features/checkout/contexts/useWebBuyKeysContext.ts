import { useContext } from "react";
import { WebBuyKeysContext } from "./WebBuyKeysContext";
import { UseWebBuyKeysOrderTotalReturn } from "@/features/hooks";


export const useWebBuyKeysContext = (): UseWebBuyKeysOrderTotalReturn => {
  const context = useContext(WebBuyKeysContext);
  if (!context) {
      throw new Error('useWebBuyKeysContext must be used within a WebBuyKeysProvider');
  }
  return context;
};