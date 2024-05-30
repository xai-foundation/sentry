import React from "react";

const MainTitle = ({ title, classNames = '', isSubHeader }: { title: string, classNames?: string, isSubHeader?: boolean }) => {
  return (
    <h2
      className={`text-white text-5xl font-bold  ${classNames} ${isSubHeader ? "sm:mb-[16px]" : "sm:mb-[25px]"} uppercase font-bold`}>
      {title}
    </h2>
  );
};

export default MainTitle;
