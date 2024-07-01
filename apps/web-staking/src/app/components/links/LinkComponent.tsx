"use client";

import Link from "next/link";
import { ElementType } from "react";

interface LinkComponentProps {
  link: string;
  content: string | JSX.Element;
  urlActivePath?: string;
  activePage?: string;
  onClick?: () => void;
  customClass?: string;
  externalTab?: boolean;
}

export function LinkComponent({
  link,
  content,
  urlActivePath,
                                activePage,
  onClick,
  customClass,
  externalTab,
}: LinkComponentProps) {

  const selectedStyles = link.split("?")[0] == activePage ?
    "bg-hornetSting border-palePearl border-1 global-clip-path" : "";


  // url === link.split("?")[0] || url.includes(urlActivePath!)
    //   ? "bg-hornetSting border-palePearl border-1 global-clip-path"
    //   : "";
  return (
    <Link href={link} target={externalTab ? "_blank" : ""} onClick={onClick}>
      <div
        className={`border-1 border-transparent text-white font-bold py-2 pl-9 text-xl hover:global-clip-path hover:bg-darkRoom ${customClass} ${selectedStyles}`}
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
    <Link
      target={externalTab ? "_blank" : "_top"}
      href={link}
      className="group text-base lg:font-medium sm:font-bold text-white hover:text-hornetSting duration-200 ease-in"
    >
      <div
        className={`flex items-center gap-2 border-1 border-transparent py-1 pl-4 ${customClass}`}
      >
        <Icon fill={color} />
        {content && <div className="">{content}</div>}
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
      className={`text-sm font-medium text-red ${customClass} hover:text-white duration-200 ease-in`}
      rel="noreferrer"
    >
      {content}
    </a>
  );
}

export function LegalLink({
  link,
  content,
  onClick,
  customClass,
  externalTab,
}: LinkComponentProps) {
  return (
    <Link
      href={link}
      target={externalTab ? "_blank" : ""}
      onClick={onClick}
      className="hover:text-white duration-200 ease-in text-elementalGrey"
    >
      <div
        className={`border-1 border-transparent font-bold pl-4 ${customClass}`}
      >
        {content}
      </div>
    </Link>
  );
}
