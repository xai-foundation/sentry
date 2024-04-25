import { Input } from "@nextui-org/input";
import { ChangeEventHandler, KeyboardEvent, ReactNode, useCallback } from "react";
import { ErrorCircle } from "../icons/IconsComponent";

interface CustomInputProps {
  onChange?: ChangeEventHandler;
  label: string | undefined;
  endContent?: ReactNode;
  value?: string;
  placeholder?: string;
  type?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

export const CustomInput = ({
  onChange,
  value,
  label,
  endContent,
  placeholder,
  type = "text",
  isInvalid,
  errorMessage,
}: CustomInputProps) => {

  // const isNumber = type === 'number';
  // const onKeyDown = useCallback((event: KeyboardEvent) => {
  //     const ignoredKeys = [8, 40, 38, 39, 37]
  //     if ((ignoredKeys.includes(event.keyCode) || event.shiftKey || event.ctrlKey)) return;
  //     if (isNumber && isNaN(Number(event.key))) {
  //       event.preventDefault();
  //       event.stopPropagation();
  //     }
  //   }, [isNumber]);

  return (
    <Input
      // onKeyDown={onKeyDown}
      type={type}
      value={value}
      classNames={{
        inputWrapper: `shadow-none relative mb-1 bg-white lg:px-5 sm:pl-2 sm:pr-2 pt-0 pb-0 data-[hover=true]:bg-white group-data-[focus=true]:bg-white h-[100px] max-w-lg`,
        label: `text-grey text-lg mb-1`,
        input: `text-[40px] ${isInvalid ? "!text-[#ED5F00]" : " "}`,
        mainWrapper: `w-xl`,
        errorMessage:
          "absolute top-[-20px] lg:left-[20px] sm:left-[10px] text-[#ED5F00] text-base font-normal",
        helperWrapper: "p-0",
      }}
      errorMessage={isInvalid && <>
            <span className="flex gap-1 items-center">
              <ErrorCircle width={16} height={16} />
              {errorMessage}
            </span>
          </>}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      labelPlacement="inside"
      endContent={endContent}
    />
  );
};

interface StakingInputProps {
  label: string | undefined | ReactNode;
  endContent?: ReactNode;
  startContent?: ReactNode;
  value?: string | (readonly string[] & string) | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  isInvalid?: boolean;
  unstake?: boolean;
  type?: string;
  errorMessage?: string;
  name?: string;
  hideErrorIcon?: boolean;
  keys?: boolean;
  classInput?: string;
}

export const StakingInput = ({
  onChange,
  label,
  endContent,
  placeholder,
  value,
  isInvalid,
  unstake,
  keys,
}: StakingInputProps) => {

  //TODO this needs to be refactored, why would not the input component not just get the error message instead of "unstake"
  const getErrorMessage = () => {
    return `Not enough ${keys ? "keys" : "esXAI"} available for ${unstake ? "unstaking" : "staking"}`;
  }

  return (
    <Input
      type="number"
      value={value}
      classNames={{
        inputWrapper: `shadow-none relative mb-1 bg-white lg:px-5 sm:pl-2 sm:pr-2 pt-0 pb-0 data-[hover=true]:bg-white group-data-[focus=true]:bg-white h-[100px] max-w-lg`,
        label: `text-grey text-lg mb-1`,
        input: `text-[40px] ${isInvalid ? "!text-[#ED5F00]" : " "}`,
        mainWrapper: `w-xl`,
        errorMessage:
          "absolute top-[-20px] lg:left-[20px] sm:left-[10px] text-[#ED5F00] text-base font-normal",
        helperWrapper: "p-0",
      }}
      onChange={onChange}
      errorMessage={
        isInvalid && (
          <>
            <span className="flex gap-1 items-center sm:text-sm lg:text-base">
              <ErrorCircle width={16} height={16} />
              {getErrorMessage()}
            </span>
          </>
        )
      }
      label={label}
      placeholder={placeholder}
      labelPlacement="inside"
      endContent={endContent}
    />
  );
};

export const PoolInput = ({
  onChange,
  label,
  placeholder,
  value,
  isInvalid,
  errorMessage,
  type,
  endContent,
  startContent,
  name,
  hideErrorIcon,
  classInput,
}: StakingInputProps) => {
  return (
    <Input
      type={type}
      value={value}
      name={name}
      classNames={{
        inputWrapper: `relative border ${isInvalid ? "border-red" : ""
        } h-[50px] pl-2 pr-4 bg-white data-[hover=true]:bg-white group-data-[focus=true]:bg-white w-full`,
        label: `text-graphiteGray text-base font-bold pb-3`,
        input: `text-[16px] px-2 rounded-xl ${classInput}`,
        mainWrapper: `w-xl`,
        errorMessage: "text-[#ED5F00] text-base font-normal",
        helperWrapper: "p-0",
        innerWrapper: `${type === "number" && "flex justify-between"}`,
      }}
      onChange={onChange}
      errorMessage={
        isInvalid && (
          <>
            <span className="flex gap-1 items-center">
              {!hideErrorIcon && <ErrorCircle width={16} height={16} />}
              {errorMessage}
            </span>
          </>
        )
      }
      label={label}
      placeholder={placeholder}
      labelPlacement="outside"
      startContent={startContent}
      endContent={endContent}
    />
  );
};
