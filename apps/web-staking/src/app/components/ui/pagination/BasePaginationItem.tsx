import React from "react";

interface BasePaginationItemProps {
  currentPage: number;
  label: number | string;
  setPage: (page: number) => void;
  extraClasses?: string;
}

const BasePaginationItem = ({ currentPage, label, setPage, extraClasses }: BasePaginationItemProps) => {
  return (
    <span
      onClick={() => setPage(+label)}
      className={`py-[8px] px-[20px] ${currentPage === label ? "bg-[#272123] text-crystalWhite" : "text-[#B1B1B1] hover:bg-[#201C1C]"} cursor-pointer clip-path-8px duration-300 ease-in ${extraClasses}`}>
      {label}
    </span>
  );
};

export default BasePaginationItem;