import { Dispatch, SetStateAction } from "react";
import { PoolInput } from "../input/InputComponent";
import { SOCIAL_LINKS } from "./constants/constants";
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
      <div className="border-t-1 w-full py-5">
        <MainTitle title="Socials" classNames="text-xl font-bold !mb-8" />
        <ul className="grid grid-rows-2 lg:grid-flow-col sm:grid-flow-row gap-4 w-full py-4">
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
