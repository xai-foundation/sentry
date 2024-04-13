"use client";

import Link from "next/link";
import { ElementType } from "react";

interface LinkComponentProps {
  link: string;
  content: string;
  onClick?: () => void;
  customClass?: string;
}

export function LinkComponent({
  link,
  content,
  onClick,
  customClass,
}: LinkComponentProps) {
  return (
    <Link href={link} onClick={onClick}>
      <div
        className={`text-base hover:bg-crystalWhite hover:border-palePearl border-1 border-transparent hover:rounded-md py-2 pl-4 ${customClass}`}
      >
        {content}
      </div>
    </Link>
  );
}

interface LinkLogoComponentProps {
  link: string;
  content: string;
  Icon: ElementType<any, keyof JSX.IntrinsicElements>;
}

export function LinkLogoComponent({
  link,
  content,
  Icon,
}: LinkLogoComponentProps) {
  return (
    <Link href={link}>
      <div className="flex items-center hover:bg-crystalWhite hover:border-palePearl border-1 border-transparent hover:rounded-md gap-2 py-1 pl-4">
        <Icon />
        <div className="text-sm">{content}</div>
      </div>
    </Link>
  );
}

export function ExternalLinkComponent({
  link,
  content,
  customClass,
}: LinkComponentProps) {
  return (
    <a
      href={link}
      target="_blank"
      className={`text-red text-sm font-medium ${customClass}`}
    >
      {content}
    </a>
  );
}
