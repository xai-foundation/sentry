import React from "react";

interface CheckboxProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  isChecked?: boolean;
  onClick?: () => void;
  extraClasses?: {
    input?: string;
    wrapper?: string;
  };
}

const Checkbox = ({ disabled, onChange, isChecked, onClick, extraClasses, children }: CheckboxProps) => {
  return (
    <label
      className={`flex w-full items-center gap-[10px] cursor-pointer select-none text-americanSilver ${extraClasses?.wrapper}`}>
      <input
        type="checkbox"
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
        checked={isChecked}
        className={`before:content[''] peer relative h-[24px] w-[24px] cursor-pointer appearance-none transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-[14px] before:w-[14px] before:-translate-y-2/4 before:-translate-x-2/4 before:bg-hornetSting before:opacity-0 before:transition-opacity checked:border-gray-900 bg-darkRoom ${!disabled && "checked:before:opacity-100"} ${disabled && "bg-dynamicBlack"} ${extraClasses?.input}`}
      />
      {children}
    </label>
  );
};

export default Checkbox;