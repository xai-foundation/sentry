interface LinkComponentProps {
  link: string;
  content: string;
  onClick?: () => void;
  customClass?: string;
  externalTab?: boolean;
  colorRed?: boolean;
}

export function ExternalLinkComponent({
  link,
  content,
  customClass,
  externalTab,
  colorRed,
}: LinkComponentProps) {
  return (
    <a
      href={link}
      target={externalTab ? "_blank" : "_top"}
      className={`text-base font-medium ${colorRed ? "text-hornetSting" : "text-white"} ${customClass} underline hover:no-underline duration-200 ease-in`}
      rel="noreferrer"
    >
      {content}
    </a>
  );
}
