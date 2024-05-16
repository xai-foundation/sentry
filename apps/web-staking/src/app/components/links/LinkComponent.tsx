"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElementType } from "react";

interface LinkComponentProps {
  link: string;
  content: string;
  onClick?: () => void;
  customClass?: string;
  externalTab?: boolean;
}

export function LinkComponent({
  link,
  content,
  onClick,
  customClass,
  externalTab
}: LinkComponentProps) {
  const url = usePathname();
  const selectedStyles =
    url === link.split("?")[0]
      ? "bg-crystalWhite border-palePearl border-1 rounded-md"
      : "";
  return (
    <Link href={link} target={externalTab ? "_blank" : ""} onClick={onClick}>
      <div
        className={`border-1 border-transparent py-2 pl-4 text-base hover:rounded-md hover:border-palePearl hover:bg-crystalWhite ${customClass} ${selectedStyles}`}
      >
        {content}
      </div>
    </Link>
  );
}

interface LinkLogoComponentProps {
  link: string;
  content?: string;
  Icon: ElementType<any, keyof JSX.IntrinsicElements>;
  customClass?: string;
  externalTab?: boolean;
  color?: string;
}

export function LinkLogoComponent({
  link,
  content,
  Icon,
  customClass,
  externalTab,
  color,
}: LinkLogoComponentProps) {
  return (
    <Link target={externalTab ? "_blank" : "_top"} href={link}>
      <div
        className={`flex items-center gap-2 border-1 border-transparent py-1 pl-4 hover:rounded-md hover:border-palePearl hover:bg-crystalWhite ${customClass}`}
      >
        <Icon fill={color} />
        {content && <div className="text-sm">{content}</div>}
      </div>
    </Link>
  );
}

export function ExternalLinkComponent({
  link,
  content,
  customClass,
  externalTab,
}: LinkComponentProps) {
  return (
    <a
      href={link}
      target={externalTab ? "_blank" : "_top"}
      className={`text-sm font-medium text-red ${customClass}`}
      rel="noreferrer"
    >
      {content}
    </a>
  );
}
