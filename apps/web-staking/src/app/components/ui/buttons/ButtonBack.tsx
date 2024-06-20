import { BackArrow } from "../../icons/IconsComponent";

export function ButtonBack({
  onClick,
  btnText,
  height = 16,
  width = 16,
                             fill,
  extraClasses,
}: {
  onClick: () => void;
  btnText: string;
  height?: number;
  width?: number;
  fill?: string;
  extraClasses?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 border-1 border-transparent p-1 hover:rounded-md hover:text-hornetSting duration-300 uppercase text-white font-bold text-lg ${extraClasses}`}
    >
      <BackArrow height={height} width={width} fill={fill} />
      <span>{btnText}</span>
    </div>
  );
}
