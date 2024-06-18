import { ErrorCircle, WarningIcon } from "../icons/IconsComponent";
import { BaseCallout, Checkbox } from "../ui";

interface WarningProps {
  title: string;
  description: string;
  checkboxText?: string;
  onAcceptTerms: () => void;
  includeYouMustAgreeMessage?: boolean;
  checkbox: boolean;
  setCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
  includeCheckbox?: boolean;
}

//The final key you unstake from this pool will take 60 days to unstake.
//All other keys you unstake will take 30 days to unstake.
//I understand the unstake periods for my keys
const WarningComponent = ({
  title,
  description,
  checkboxText,
  onAcceptTerms,
  includeYouMustAgreeMessage,
  checkbox,
  setCheckbox: setCh,
  includeCheckbox = true,
}: WarningProps) => {
  return (
    <>
      <BaseCallout
        extraClasses={{
          calloutWrapper: "!items-start mb-7",
          calloutFront: "!justify-start !items-start",
        }}
        isWarning
      >
        <div className="pt-2 sm:mr-2 lg:mr-5">
          <WarningIcon className="mr-2 min-w-[27px]" />
        </div>
        <div className="flex flex-col">
          <span className="text-bananaBoatText font-bold mb-2">{title}</span>
          <span className="text-bananaBoatText">{description}</span>
        </div>
      </BaseCallout>

      {includeYouMustAgreeMessage && (
        <div className="mb-3">
          <span className="text-graphiteGray">
            You must agree to the following before continuing
          </span>
        </div>
      )}

      {includeCheckbox && (
        <div className="flex">
          <div className="min-w-[25px]">
            <Checkbox
              isChecked={checkbox}
              onClick={onAcceptTerms}
              onChange={() => setCh(!checkbox)}
              extraClasses={{ wrapper: "!items-start"  }}
            >
              <span className="text-americanSiver text-lg">{checkboxText}</span>
            </Checkbox>
          </div>
        </div>
      )}
    </>
  );
};

export default WarningComponent;
