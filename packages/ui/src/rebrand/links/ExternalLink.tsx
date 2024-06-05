import {ReactNode} from "react";

interface LinkComponentProps {
    link: string;
    content: string | ReactNode;
    onClick?: () => void;
    customClass?: string;
    externalTab?: boolean;
    colorRed?: boolean;
}

export function ExternalLink({
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
            className={`text-base font-medium ${colorRed ? "text-hornetSting" : "text-white"} underline hover:no-underline duration-200 ease-in ${customClass}`}
            rel="noreferrer"
        >
            {content}
        </a>
    );
}
