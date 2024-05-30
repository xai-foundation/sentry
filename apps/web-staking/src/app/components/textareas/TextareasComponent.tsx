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
        inputWrapper: `relative ${isInvalid ? "bg-bananaBoat" : "bg-greyBorders"} rounded-none global-input-clip-path ${
          isInvalid ? "border-red" : ""
        } p-[1px] ${isInvalid ? "data-[hover=true]:bg-bananaBoat group-data-[focus=true]:bg-bananaBoat" : "data-[hover=true]:bg-hornetSting group-data-[focus=true]:bg-hornetSting"}`,
        label: `text-lg !text-americanSilver font-bold pb-3 `,
        input: "text-lg !text-americanSilver !placeholder-dugong pl-[10px] !bg-nulnOil global-input-clip-path py-2",
        errorMessage: "absolute text-[#ED5F00] text-base font-normal",
        helperWrapper: "p-0",
      }}
    />
  );
};
