import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import additionalInfoBackground from "@/assets/images/dashboard-promo.png";
import { PrimaryButton } from "@/app/components/ui";
import { ExternalLinkComponent } from "@/app/components/ui/links/ExternalLink";
import { CloseIcon } from "@/app/components/icons/IconsComponent";

interface DashboardPromoProps {
  chainId: number | undefined;
}
const DashboardPromo = ({ chainId }: DashboardPromoProps) => {

  const [isShowBanner, setIsShowBanner] = useState<any>();

  useEffect(() => {
    let value;
    value = localStorage.getItem("dashboardPromo") || "1";
    setIsShowBanner(+value);
  }, []);

  const closeBanner = (e: any) => {
    e.preventDefault();
    setIsShowBanner(0);
    localStorage.setItem("dashboardPromo", "0");
  };

  const router = useRouter();
  return (
    <>
      {!!isShowBanner && <section
        className="relative flex w-full flex-col bg-white py-0 md:py-[50px] mt-10 md:px-[35px] px-[17px]">
        <div className="relative z-10 order-2 mt-[109px] md:mt-0 w-full">
        <span className="block md:text-3xl text-2xl font-bold text-white w-full md:max-w-full max-w-[279px]">
          Stake esXAI or Sentry Keys to earn rewards
        </span>
          <span className="block text-white font-semibold text-lg mt-[11px] w-full md:max-w-full max-w-[323px]">
          Bought XAI? You can redeem it for esXAI and stake it for even more
          rewards
        </span>
          <div className="flex items-center mb-7 md:mt-[26px] mt-[11px] md:mb-0 md:gap-[25px] gap-[10px]">
            <PrimaryButton
              onClick={() => router.push(`/staking?chainId=${chainId}`)}
              colorStyle="secondary"
              btnText={"Stake now"}
              className="mr-4 !global-double-clip-path-15px uppercase !text-xl"
            />
            <ExternalLinkComponent
              link={"/redeem"}
              content={"Redeem"}
              customClass="!text-xl text-white !font-bold uppercase no-underline"
            />
          </div>
        </div>
        <span className="absolute z-30 right-[20px] top-[20px] cursor-pointer" onClick={closeBanner}>
        <CloseIcon width={12} height={12} fill="#ffffff" />
      </span>

        <Image
          className="absolute !left-0"
          layout="fill"
          objectFit="cover"
          src={additionalInfoBackground}
          alt="additionalInfoBackground"
        />
      </section>
      }</>
  )
    ;
};

export default DashboardPromo;
