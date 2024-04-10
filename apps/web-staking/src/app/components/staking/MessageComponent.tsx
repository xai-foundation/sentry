import { CloseIcon, InfoPointBlue } from "../icons/IconsComponent";

const MessageComponent = ({
  showMessage,
  onClick,
}: {
  showMessage: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`relative flex flex-col w-full py-5 px-[40px] bg-[#EDF6FF] ${
        showMessage ? "block" : "hidden"
      } mb-4 rounded-md`}
    >
      <div className="absolute top-6 left-3">
        <InfoPointBlue width={20} height={17} />
      </div>
      <span className="font-bold text-[#0F5096]">
        Your original V1 stake is listed below
      </span>
      <span className="text-[#0F5096]">
        Your tier will continue to apply but you cannot add to this stake. Only
        pools can have stake added to them.
      </span>
      <button
        type="button"
        onClick={onClick}
        className="absolute top-3 right-3"
      >
        <CloseIcon width={13} height={13} />
      </button>
    </div>
  );
};

export default MessageComponent;
