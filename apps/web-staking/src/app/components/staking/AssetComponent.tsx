import { useRouter } from "next/navigation";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { PrimaryButton } from "../buttons/ButtonsComponent";
import InfoComponent from "./PurchaseComponent";
import { ExternalLinkComponent } from "../links/LinkComponent";

export const AssetComponent = ({
  address,
}: {
  address: string | undefined;
}) => {
  const router = useRouter();
  return (
    <>
      {address && (
        <BorderWrapperComponent customStyle="lg:mr-2 flex sm:flex-col lg:flex-row justify-between sm:p-4 lg:p-5 px-5 w-full lg:h-[105px] sm:h-[250px]">
          <InfoComponent />
          <div className="flex flex-row items-center sm:justify-around gap-2">
            <ExternalLinkComponent
              link={
                "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot"
              }
              content={"Buy XAI"}
              customClass="lg:mr-4"
            />
            <PrimaryButton
              onClick={() => router.push("/redeem")}
              btnText="Redeem XAI for esXAI"
              className="sm:w-[170px] lg:w-[200px] h-[50px] font-bold"
            />
          </div>
        </BorderWrapperComponent>
      )}
    </>
  );
};

export default AssetComponent;
