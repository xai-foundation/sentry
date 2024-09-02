'use client';

import { RedemptionProvider } from '@/context/redemptionsContext';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class">
        <ToastContainer className="toast-container" />
        <RedemptionProvider>
          {children}
        </RedemptionProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
