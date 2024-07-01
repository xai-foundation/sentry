import { ArrowIcon } from "../icons/IconsComponents";

interface TextButtonProps {
  onClick: () => void;
  buttonText: string;
  className?: string;
  textClassName?: string;
  isArrow?: boolean;
  isDisabled?: boolean;
}

export const TextButton = ({
  onClick,
  className,
  buttonText,
  isArrow,
  isDisabled,
  textClassName,
}: TextButtonProps) => {
  return (
    <button
      className={`flex items-center rounded-none font-bold text-base p-2 text-hornetSting duration-200 ease-in global-clip-path hover:text-white ${className} text-button`}
      type="submit"
      onClick={onClick}
      disabled={isDisabled}
    >
      <span className={`mr-2 w-full ${textClassName}`}>{buttonText}</span>
      {isArrow && <ArrowIcon />}
    </button>
  );
};
