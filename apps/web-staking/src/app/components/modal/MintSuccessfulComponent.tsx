"use client";

import { useState } from "react";
import { useDisclosure } from "@nextui-org/react";
import { BaseModal } from "@/app/components/ui";

const MintSuccessfulComponent = ({ isOpen, setOpen }: { isOpen: boolean, setOpen: () => void }) => {
  const { onClose } = useDisclosure();
  const [openModal, setOpenModal] = useState(isOpen);

  const closeModal = () => {
    setOpenModal(false);
    setOpen;
  }
  return (
    <BaseModal
      isOpened={openModal}
      withOutCloseButton
      withOutCancelButton
      modalBody={<>
        <div className="flex items-center">
          <div className="items-baseline mr-[10px]">
            Stake your key in a pool to start earning rewards!
          </div>
        </div>
      </>}
      closeModal={onClose}
      submitText="Continue"
      onSubmit={() => closeModal()}
    />
  );
};

export default MintSuccessfulComponent;