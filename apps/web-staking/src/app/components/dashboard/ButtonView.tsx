import React from "react";
import { ConnectButton, PrimaryButton } from "../buttons/ButtonsComponent";
import { ExternalLinkComponent } from "../links/LinkComponent";
import { binanceLink } from "@/app/components/dashboard/constants/constants";
import { useRouter } from "next/navigation";

interface ButtonViewProps {
  onOpen: () => void;
  address: string | undefined;
}

const ButtonView = ({ onOpen, address }: ButtonViewProps) => {
  const router = useRouter();
  return (
    <div className="flex lg:flex-row sm:flex-col justify-end lg:px-6 lg:py-3 sm:mb-10 lg:mb-0">
      {!address ? (
        <ConnectButton onOpen={onOpen} address={address}/>
      ) : (
        <div className="flex lg:flex-row sm:flex-col-reverse items-center lg:h-[50px] sm:w-full">
          <ExternalLinkComponent link={binanceLink} content={"Buy XAI"} />
          <PrimaryButton
            btnText="Redeem"
            onClick={() => {
              router.push("/redeem");
            }}
            className="w-[115px] h-[50px] lg:ml-6 sm:w-full lg:w-auto font-semibold sm:mb-6 lg:mb-0"
          />
        </div>
      )}
    </div>
  );
};

export default ButtonView;
