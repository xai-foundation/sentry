import { useRouter } from "next/navigation";
import { ConnectButton, PrimaryButton } from "../buttons/ButtonsComponent";

interface PoolButtonProps {
  onOpen: () => void;
  address: string | undefined;
  isApproved: boolean;
}

const PoolButtonComponent = ({
  address,
  onOpen,
  isApproved,
}: PoolButtonProps) => {
  const router = useRouter();

  return (
    <div className="mb-7">
      {address ? (
        <PrimaryButton
          btnText="Create pool"
          onClick={() => router.push("/pool/create")}
          className={`font-semibold ${isApproved
              ? ""
              : "bg-[#F1F1F1] text-[#D4D4D4]"
            }`}
          isDisabled={!isApproved}
        />
      ) : (
        <ConnectButton onOpen={onOpen} address={address} />
      )}
    </div>
  );
};

export default PoolButtonComponent;
