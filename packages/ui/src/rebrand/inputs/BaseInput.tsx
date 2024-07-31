import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";

export enum InputSizes {
  md = "md",
  lg = "lg"
}

interface InputProps {
  placeholder: string,
  placeholderColor?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  value: string,
  label?: string,
  labelText?: string,
  name?: string,
  type?: "text" | "number" | "url",
  size?: InputSizes;
  withIcon?: boolean,
  disabled?: boolean,
  endContent?: React.ReactNode
  isInvalid?: boolean,
  widthProperties?: {
    //for now, we need this because we want to do calculations because of specific border implementation,
    // maybe we can improve this approach in future
    inputWrapper?: number;
  },
  inputMaxWidth?: string
  onClick?: () => void
}

//todo fix font
//todo create hover transition

export const Input = ({
                 name,
                 placeholder,
                 placeholderColor = "placeholder-americanSilver",
                 onChange,
                 value,
                 label,
                 labelText,
                 size = InputSizes.md,
                 type = "text",
                 withIcon,
                 disabled,
                 endContent,
                 isInvalid = false,
                 widthProperties,
                 inputMaxWidth,
                 onClick
               }: InputProps) => {
  const inputHeight = size === InputSizes.md ? "h-[40px]" : "h-[48px]";
  const borderHeight = size === InputSizes.md ? "h-[38px]" : "h-[46px]";
  const [isFocused, setIsFocused] = useState(false);
    return (
    <div className={`flex flex-col max-w-[${widthProperties?.inputWrapper}px]`}>
        {label && <span className="text-lg text-americanSilver font-bold mb-[8px]">{label}</span>}
        {labelText && <span className="text-lg text-americanSilver font-medium mb-[8px]">{labelText}</span>}
      <div
        className={`flex w-full group ${inputHeight} px-[12px] justify-center items-center relative cursor-text max-w-[${widthProperties?.inputWrapper}px]`}>
      <span
        className={`global-input-clip-path w-full max-w-[calc(100%-2px)] bg-nulnOil ${borderHeight} absolute z-10 ${isFocused && "bg-[#524D4F]"}`}></span>
        <span
          className={`global-input-clip-path max-w-[${widthProperties?.inputWrapper}px] bg-foggyLondon ${isInvalid && "!bg-bananaBoat"} ${isFocused && !isInvalid && "bg-pelati"} ${!disabled && "group-hover:bg-pelati"} ${disabled && "!bg-chromaphobicBlack"} w-full ${inputHeight} absolute z-[5]`}>
      </span>
        {withIcon &&
          <button className="z-20" onClick={onClick}><CiSearch className="mr-2 text-dugong size-[20px]" /></button>}
        <input type={type}
               name={name}
               placeholder={placeholder}
               onFocus={() => setIsFocused(prev => !prev)}
               onBlur={() => setIsFocused(prev => !prev)}
               onChange={onChange}
               value={value}
               disabled={disabled}
               className={`${inputHeight} w-full group z-20 bg-transparent ${disabled ? "text-darkRoom" : "text-americanSilver"} ${disabled ? "placeholder-darkRoom" : `${placeholderColor}`} focus:outline-0 ${inputMaxWidth && `${inputMaxWidth}`} base-input`} />
        {endContent && endContent}
      </div>
    </div>
  );
};
