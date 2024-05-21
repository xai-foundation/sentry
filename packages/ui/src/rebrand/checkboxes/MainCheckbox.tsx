interface CheckboxProps {
  onChange: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  isChecked?: boolean;
  labelStyle?: string;
}

const MainCheckbox = ({
  disabled,
  onChange,
  isChecked,
  children,
  labelStyle,
}: CheckboxProps) => {
  return (
    <label className={`flex items-center gap-[10px] cursor-pointer select-none text-americanSilver !rounded-none ${labelStyle} checkboxLabel`}>
      <input
        type="checkbox"
        onChange={onChange}
        disabled={disabled}
        checked={isChecked}
        className={`before:content[''] peer relative h-[24px] w-[24px] cursor-pointer !rounded-none appearance-none transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-[14px] before:w-[14px] before:-translate-y-2/4 before:-translate-x-2/4 before:bg-hornetSting before:opacity-0 before:transition-opacity checked:border-gray-900 bg-[#525252] ${
          !disabled && "checked:before:opacity-100"
        } ${disabled && "bg-dynamicBlack"}`}
      />
      {children}
    </label>
  );
};

export default MainCheckbox;
