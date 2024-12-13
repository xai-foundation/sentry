import React, { useEffect, useState } from "react";
import ExternalLinkIcon from "../../../../../packages/ui/src/rebrand/icons/ExternalLinkIcon";
import { CloseIcon } from "./icons/IconsComponent";

interface IAnnouncementBanner {
  activateBanner: boolean; // Externally control if the banner should be shown at all. Set to false if no banner should be displayed in a release
  bannerVersion: string; // Banner version for session storage. Used to enable setting a new announcement banner even if it previously has been closed
  title: string; // Title of the banner
  text: string; // Text of the banner - currently not being used because the design requires styling parts of the text differently
  href: string;
  href2: string;
  icon: React.ReactNode;
}

const AnnouncementBanner = ({ title, text, href, activateBanner, bannerVersion, icon, href2}: IAnnouncementBanner) => {

    const sessionKey = `announcement_banner_${bannerVersion}`

    const [isShow, setIsShow] = useState<number>(Number(sessionStorage.getItem(sessionKey)));

    useEffect(() => {
        const value = sessionStorage.getItem(sessionKey) || Number(activateBanner);
        setIsShow(Number(value));
    }, []);

    const closeBanner = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setIsShow(0);
        sessionStorage.setItem(sessionKey, "0");
    };

  return (
    <>
      {activateBanner && isShow ? (
        <div className="relative w-full p-4 announcementBannerGradient grid grid-cols-[auto,1fr,auto] items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-start justify-start">
            {icon}
          </div>

          {/* Content Container */}
          <div className="flex flex-col items-start justify-center md:justify-start">
            {/* Headline and Learn More Link Container */}
            <div className="flex flex-wrap md:flex-nowrap items-baseline gap-2 md:gap-2">
              <p className="font-rajdhani text-[16px] font-bold leading-[20px] tracking-[0.01em] text-nulnOil">
                {title}
              </p>

              {/* Learn More Link with Icon */}
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center font-rajdhani text-[16px] font-bold leading-[20px] tracking-[0.01em] text-nulnOil underline whitespace-nowrap"
                >
                Learn more
                <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center ml-1">
                    <ExternalLinkIcon extraClasses={{ svgClasses: "mt-[-4px]" }} />
                </div>
            </a>

            </div>

            {/* Secondary Text Content */}
            <p className="md:mt-0 mt-2 font-rajdhani text-[16px] font-medium leading-[20px] tracking-[0.01em] text-nulnOil">
              Your wallet address can be used as a promo code earning you 15% for any key sales when the sale goes live on Dec 15 at sentry.xai.games. Check this
              <a
                href={href2}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-solid decoration-gray-800 underline-offset-[2px] text-[#140F0F] font-medium px-[2px]"
              >
                marketing guide
              </a>{" "}
              to help you maximize your referrals.
            </p>
          </div>

          {/* Close Icon */}
          <button
            onClick={closeBanner}
            className="w-6 h-6 cursor-pointer md:w-8 md:h-8"
            aria-label="Close Banner"
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}
    </>
  );
};

export default AnnouncementBanner;
