import { Dispatch, SetStateAction } from "react";

import { SOCIAL_LINKS } from "./constants/constants";
import MainTitle from "../titles/MainTitle";
import BaseInput, { InputSizes } from "../ui/inputs/BaseInput";

type Links = {
  discord: string;
  twitter: string;
  website: string;
  instagram: string;
  youTube: string;
  telegram: string;
  tiktok: string;
};

interface SocialLinks {
  socialLinks: Links;
  setSocialLinks: Dispatch<SetStateAction<Links>>;
  editStyles?: boolean;
}

const SocialLinksComponent = ({ socialLinks, setSocialLinks, editStyles }: SocialLinks) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({
      ...socialLinks,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <>
      <div className="w-full py-5 px-6 border-b border-chromaphobicBlack bg-nulnOilBackground pb-5 shadow-default">
        <MainTitle title="Socials" classNames="text-[30px] font-bold normal-case !mb-0" />
      </div>
      <div className={`w-full py-5 px-6 bg-nulnOilBackground ${editStyles && "sm:mb-[10px] lg:mb-[30px]"} mb-[30px] shadow-default`}>
        <ul className="grid w-full grid-rows-2 gap-4 gap-y-0 sm:grid-flow-row lg:grid-flow-col">
          {SOCIAL_LINKS.map((item, index) => (
            <li key={index} className="mb-5">
              <BaseInput
                name={item.name}
                type="url"
                label={item.label}
                placeholder={`Enter ${item.label} here`}
                placeholderColor="placeholder-dugong text-lg"
                size={InputSizes.lg}
                onChange={handleChange}
                value={socialLinks[item.name as keyof Links]}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SocialLinksComponent;
