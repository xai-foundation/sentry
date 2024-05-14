import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

import { PrimaryButton } from "@/app/components/buttons/ButtonsComponent";
import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";
import additionalInfoBackground from "@/assets/images/sai_pane.png";

interface DashboardPromoProps {
  chainId: number | undefined;
}
const DashboardPromo = ({ chainId }: DashboardPromoProps) => {
  const router = useRouter();
  return (
    <section
      className="relative flex w-full flex-col items-center overflow-hidden bg-crystalWhite py-0 md:py-[50px] xl:px-0 mt-5">
      <div className="relative z-10 order-2 mt-8 md:mt-0 w-full max-w-[928px] px-5 xl:px-0">
        <span className="block text-xl font-bold text-lightBlackDarkWhite">
          Stake esXAI or Sentry Keys to earn rewards
        </span>
        <span className="block text-lightBlackDarkWhite">
          Bought XAI? You can redeem it for esXAI and stake it for even more
          rewards
        </span>
        <div className="mb-7 mt-[26px] md:mb-0">
          <PrimaryButton
            onClick={() => router.push(`/staking?chainId=${chainId}`)}
            btnText={"Stake now"}
            className="mr-4"
          />
          <ExternalLinkComponent
            link={"/redeem"}
            content={"Redeem"}
            customClass="!text-base"
          />
        </div>
      </div>
      <div className="relative top-0 order-1 h-[165px] w-full overflow-hidden md:absolute md:h-full">
        <Image
          className={`absolute right-1/2 top-[-75px] z-0
            h-[373px] w-auto translate-x-1/2
            md:right-[200px] md:top-[-210px] md:h-[710px] lg:right-[250px] lg:top-[-225px] 2xl:right-[450px]`}
          src={additionalInfoBackground}
          alt="additionalInfoBackground"
        />
      </div>
    </section>
  );
};

export default DashboardPromo;
