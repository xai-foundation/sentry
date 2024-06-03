"use client";

import { useState } from "react";
import { useDisclosure } from "@nextui-org/react";
import { ExternalLinkComponent } from "../links/LinkComponent";
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from "@/app/utils/useLocalStorage";
import { BaseModal, Checkbox } from "@/app/components/ui";

const AgreeModalComponent = ({ address }: { address: string | undefined }) => {
  const { onClose } = useDisclosure();
  const [checkbox, setChecbox] = useState(false);
  const [openModal, setOpenModal] = useState(
    !address && !checkTermsConfirmation("terms")
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecbox(e.target.checked);
    setLocalStorageItem("terms", "true");
  };

  function checkTermsConfirmation(key: string) {
    return getLocalStorageItem(key);
  }

  return (
    <BaseModal
      isOpened={openModal}
      withOutCloseButton
      withOutCancelButton
      isDisabled={!checkbox}
      modalBody={<>
          <span className="text-base text-white">
            {"Before staking or redeeming, you must agree to our "}
            <ExternalLinkComponent
              link={"https://xai.games/stakingterms"}
              content={"Staking Terms"}
              customClass="!text-base"
            />
            {", "}
            <ExternalLinkComponent
              link={"https://xai.games/generalterms"}
              content={"General Terms"}
              customClass="!text-base"
            />
            {" and "}
            <ExternalLinkComponent
              link={"https://xai.games/privacypolicy"}
              content={"Privacy Policy"}
              customClass="!text-base"
            />
            {" before continuing."}
          </span>
        <div className="flex items-center">
          <div className="items-baseline mr-[10px]">
            <Checkbox onChange={onChange}>
               <span className="text-white">
                I accept the{" "}
                 <ExternalLinkComponent
                   link={"https://xai.games/stakingterms"}
                   content={"Staking Terms"}
                   customClass="!text-base"
                 />
                 {", "}
                 <ExternalLinkComponent
                   link={"https://xai.games/generalterms"}
                   content={"General Terms"}
                   customClass="!text-base"
                 />
                 {" and "}
                 <ExternalLinkComponent
                   externalTab
                   link={"https://xai.games/privacypolicy"}
                   content={"Privacy Policy"}
                   customClass="!text-base"
                 />
              </span>
            </Checkbox>

          </div>
        </div>
      </>}
      closeModal={onClose}
      modalHeader="Agree to the terms before continuing"
      submitText="Continue"
      onSubmit={() => setOpenModal(false)}
    />
  );
};

export default AgreeModalComponent;
