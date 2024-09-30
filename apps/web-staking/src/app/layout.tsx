import type { Metadata } from "next";
// import { headers } from 'next/headers'
// import { config } from '@/config'
import { ContextProvider } from "@/context";

import "./globals.css";
import { Providers } from "./providers";
import WrapperComponent from "./components/navbar/WrapperComponent";
import { IpLocationChecker } from "@/app/IpLocationChecker";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ReactCookieConsent } from "./components/ReactCookieConsent";
// import { cookieToInitialState } from 'wagmi'

export const metadata: Metadata = {
  title: {
    default: `Xai`,
    template: `%s | Xai`,
  },
  description: "Xai App"
};

const gaId = (process.env.NEXT_PUBLIC_APP_ENV === "development" || process.env.NODE_ENV === "development") ? "G-HCMYTPJ8K0" as const : "G-P3K185SNJR" as const;

export default function xRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <head>
        <meta name="title" property="og:title" content="Xai Staking App"/>
        <meta name="description" property="og:description" content="Stake keys & esXai to earn rewards"/>
        <meta name="image" property="og:image" content="https://develop.app.xai.games/images/sentry-share.jpg"/>
        <meta name="url" property="og:url" content="https://app.xai.games"/>
        <meta name="type" property="og:type" content="website"/>    
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:site" content="@xai_games"/>
        <meta name="twitter:title" content="Xai Staking App"/>
        <meta name="twitter:description" content="Stake keys & esXai to earn rewards"/>
        <meta name="twitter:image" content="https://develop.app.xai.games/images/sentry-share.jpg"/>
        <meta name="twitter:creator" content="@xai_games"/>
      </head>
      <body className="bg-background-image overflow-y-scroll bg-cover bg-fixed bg-center bg-no-repeat">
        <ContextProvider>
            <IpLocationChecker>
              <Providers>
                {/* <ThemeSwitcher /> */}
                <WrapperComponent>
                  {children}
                </WrapperComponent>
                <ReactCookieConsent />
              </Providers>
            </IpLocationChecker>
        </ContextProvider>
      </body>
      <GoogleAnalytics gaId={gaId} />
    </html>
  );
}
