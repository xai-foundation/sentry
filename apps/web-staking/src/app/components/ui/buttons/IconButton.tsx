"use client";

interface IconButtonProps {
  onClick: () => void;
  className?: string;
  Icon: ({
    width,
    height,
    fill,
  }: {
    width?: number | undefined;
    height?: number | undefined;
    fill?: string | undefined;
  }) => React.JSX.Element;
  size: "sm" | "lg";
}

export const IconButton = ({
  onClick,
  className,
  size,
  Icon,
}: IconButtonProps) => {

  return (
    <button
      className={`flex group items-center rounded-none font-bold text-base text-hornetSting duration-200 ease-in global-clip-path hover:text-white ${className} text-button`}
      type="submit"
      onClick={onClick}
    >
      {<Icon width={size === "sm" ? 25 : 67} height={size === "sm" ? 20 : 52} />}
    </button>
  );
};
