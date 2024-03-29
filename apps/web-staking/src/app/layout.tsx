import type { Metadata } from "next";
// import { headers } from 'next/headers'
// import { config } from '@/config'
import { ContextProvider } from "@/context";

import "./globals.css";
import { Providers } from "./providers";
import WrapperComponent from "./components/navbar/WrapperComponent";
// import { cookieToInitialState } from 'wagmi'

export const metadata: Metadata = {
  title: "Xai Staking",
  description: "Xai staking overview"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ContextProvider>
          <Providers>
            {/* <ThemeSwitcher /> */}
            <WrapperComponent>
              {children}
            </WrapperComponent>
          </Providers>
        </ContextProvider>
      </body>
    </html>
  );
}
