import { ErrorCircle } from "../icons/IconsComponent";

interface WarningProps {
  onAcceptTerms: () => void;
  checkbox: boolean;
  setCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
}

const WarningComponent = ({
  onAcceptTerms,
  checkbox,
  setCheckbox: setCh,
}: WarningProps) => {
  return (
    <>
      <div className="flex relative flex-col mb-4 bg-[#FFF9ED] text-left px-[40px] py-[25px] w-full p-3 rounded-xl">
        <div className="absolute top-7 left-3">
          <ErrorCircle width={20} height={20} />
        </div>
        <span className="text-[#C36522] font-bold">
          At least one key must always be staked with this pool
        </span>
        <span className="text-[#C36522]">
          Pools cannot be deleted, so one key will always be staked.
        </span>
      </div>
      <div className="flex pl-[10px] pr-[50px] mb-[50px]">
        <div className="py-[2px] mr-[10px]">
          <input
            checked={checkbox}
            onClick={onAcceptTerms}
            className="accent-red w-4 h-3.5 border-0 rounded-md focus:ring-0"
            type="checkbox"
            onChange={() => setCh(!checkbox)}
          />
        </div>
        <div>
          <span className="text-graphiteGray">
            I understand that one key will be always be staked once this pool
            has been created
          </span>
        </div>
      </div>
    </>
  );
};

export default WarningComponent;
