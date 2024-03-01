import type { Metadata } from "next";
import { ContextProvider } from "@/context";

import "./globals.css";
import { Providers } from "./providers";
import WrapperComponent from "./components/navbar/WrapperComponent";

export const metadata: Metadata = {
  title: "Xai Staking",
  description: "Xai staking dashboard",
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
