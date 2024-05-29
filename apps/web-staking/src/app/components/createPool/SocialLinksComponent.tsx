import { Dispatch, SetStateAction } from "react";

import { SOCIAL_LINKS } from "./constants/constants";
import { PoolInput } from "../input/InputComponent";
import MainTitle from "../titles/MainTitle";

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
}

const SocialLinksComponent = ({ socialLinks, setSocialLinks }: SocialLinks) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({
      ...socialLinks,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <>
      <div className="w-full border-t-1 py-5">
        <MainTitle title="Socials" classNames="text-xl font-bold !mb-8" />
        <ul className="grid w-full grid-rows-2 gap-4 py-4 sm:grid-flow-row lg:grid-flow-col">
          {SOCIAL_LINKS.map((item, index) => (
            <li key={index} className="mb-7">
              <PoolInput
                name={item.name}
                type="url"
                label={item.label}
                placeholder=" "
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
