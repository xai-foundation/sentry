import React from "react";

const MainTitle = ({ title, classNames = '', isSubHeader }: { title: string, classNames?: string, isSubHeader?: boolean }) => {
  return (
    <h2 className={`text-lightBlackDarkWhite text-[32px] font-bold  ${classNames} ${isSubHeader ? 'sm:mb-[16px]': 'sm:mb-[25px]'}`}>
      {title}
    </h2>
  );
};

export default MainTitle;
