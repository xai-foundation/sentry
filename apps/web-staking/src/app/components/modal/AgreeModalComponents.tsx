import { useState } from "react";
import { useDisclosure } from "@nextui-org/react";
import { ExternalLinkComponent } from "../links/LinkComponent";
import { ModalTermsAndConditions } from "./ModalComponent";

const AgreeModalComponent = ({ address }: { address: string | undefined }) => {
  const { isOpen, onOpenChange } = useDisclosure();
  const [checkbox, setChecbox] = useState(false);
  const [openModal, setOpenModal] = useState(
    !address && !checkTermsConfirmation("terms")
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecbox(e.target.checked);
    if (typeof window !== "undefined") {
      localStorage.setItem("terms", "true");
    }
  };

  function checkTermsConfirmation(key: string) {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key) || "";
    }
  }

  return (
    <ModalTermsAndConditions
      isOpen={openModal}
      onOpenChange={onOpenChange}
      onSuccess={() => setOpenModal(false)}
      checkbox={checkbox}
      cancelBtnText="No"
      confirmBtnText="Continue"
      modalHeader="Agree to the terms before continuing"
      modalBody={
        <>
          <span className="text-base text-graphiteGray">
            {"Before staking or redeeming, you must agree to our "}
            <ExternalLinkComponent
              link={""}
              content={"Terms and Conditions"}
              customClass="!text-base"
            />
            {" before continuing."}
          </span>
          <div className="flex items-center">
            <div className="items-baseline mr-[10px]">
              <input
                checked={checkbox}
                className="accent-red w-4 h-4 border-0 rounded-md focus:ring-0"
                type="checkbox"
                onChange={onChange}
              />
            </div>
            <div className="pb-1">
              <span className="text-graphiteGray">
                I agree to the{" "}
                <ExternalLinkComponent
                  link={""}
                  content={"Terms and Conditions"}
                  customClass="!text-base"
                />
              </span>
            </div>
          </div>
        </>
      }
    />
  );
};

export default AgreeModalComponent;
