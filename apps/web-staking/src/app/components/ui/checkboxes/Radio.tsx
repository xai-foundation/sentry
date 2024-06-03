import React, { createContext, useContext } from "react";

interface RadioProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

interface RadioGroupProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  children: React.ReactNode;
  extraClasses?: string;
}

interface RadioContextInterface {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

//todo Check if checked radio centered correctly

const RadioContext = createContext<RadioContextInterface>({} as RadioContextInterface);

export const Radio = (props: RadioProps) => {
  const { value, onChange } = useContext(RadioContext);
  return (
    <label
      className={`w-full flex items-center text-lg text-americanSilver ${props.disabled && `text-darkRoom`} gap-[10px] cursor-pointer`}>
      <input
        type="radio"
        value={props.value}
        onChange={onChange}
        checked={value === props.value}
        disabled={props.disabled}
        className={`before:content[''] peer relative h-[24px] w-[24px] rounded-full before:rounded-full cursor-pointer appearance-none transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-[14px] before:w-[14px] before:-translate-y-2/4 before:-translate-x-2/4 before:bg-hornetSting before:opacity-0 before:transition-opacity checked:border-gray-900 bg-darkRoom ${!props.disabled && "checked:before:opacity-100"} ${props.disabled && "bg-dynamicBlack"}`}
      />
      {props.children}
    </label>
  );
};

export const RadioGroup = ({ value, onChange, children, extraClasses }: RadioGroupProps) => {
  return <RadioContext.Provider value={{ value, onChange }}>
    <div className="w-full">
      {children}
    </div>
  </RadioContext.Provider>;
};

