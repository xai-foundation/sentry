import { ChangeEventHandler } from "react";
import { Textarea } from "@nextui-org/react";
import { ErrorCircle } from "../icons/IconsComponent";

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  isInvalid?: boolean;
  errorMessage?: string;
  name?: string;
}

export const PoolTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  isInvalid,
  errorMessage,
  name
}: TextareaProps) => {
  return (
    <Textarea
      value={value}
      label={label}
      name={name}
      labelPlacement="outside"
      placeholder={placeholder}
      maxRows={10}
      minRows={5}
      onChange={onChange}
      classNames={{
        inputWrapper: `relative border ${
          isInvalid ? "border-red" : ""
        } px-4 bg-white data-[hover=true]:bg-white group-data-[focus=true]:bg-white`,
        label: `text-graphiteGray text-base font-bold pb-3`,
        input: "text-[16px]",
        errorMessage: "absolute text-[#ED5F00] text-base font-normal",
        helperWrapper: "p-0",
      }}
      errorMessage={
        isInvalid && (
          <>
            <span className="flex gap-1 items-center">
              <ErrorCircle width={16} height={16} />
              {errorMessage}
            </span>
          </>
        )
      }
    />
  );
};
