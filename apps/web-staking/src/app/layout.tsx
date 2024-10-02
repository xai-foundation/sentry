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
  description: "Xai App",
  openGraph: {
      title: "Xai App",
      description: "Stake keys & esXai to earn rewards",
      url: "https://app.xai.games",
      siteName: "Xai Games",
      images: [
        {
          url: '/images/xai-preview.jpg',
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Xai App',
      description: 'Stake keys & esXai to earn rewards',
      siteId: '@xai_games',
      creator: '@xai_games',
      images: ['/images/xai-preview.jpg'],
    },
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
