import React from "react";
import { PaginationArrowLeft, PaginationArrowRight } from "@/app/components/icons/IconsComponent";
import { BasePaginationItem } from "@/app/components/ui";

interface BasePaginationProps {
  currentPage: number;
  setPage: (page: number) => void;
  totalPages: number;
}

//todo add dots

const BasePagination = ({ currentPage, setPage, totalPages }: BasePaginationProps) => {
  const firstPage = currentPage === 1;
  const lastPage = currentPage === totalPages;
  return (
  <>
    {totalPages > 1 ? 
    (<div className="text-lg font-bold flex items-center">
          <button onClick={() => { !firstPage ? setPage(currentPage - 1) : setPage(1) }} className={`w-[46px] h-[44px] py-3 px-5 global-input-clip-path ${firstPage ? "" : "hover:bg-dynamicBlack duration-300 easy-in"}`}>
        <PaginationArrowLeft fill={firstPage ? "fill-[#433F3F]" : "fill-white"}  />
      </button>
      <BasePaginationItem setPage={setPage} label={1} currentPage={currentPage} extraClasses="" />
      {currentPage - 2 > 1 && <span className="text-[#B1B1B1] mx-1">...</span>}
      {!firstPage && currentPage - 1 !== 1 &&
        <BasePaginationItem setPage={setPage} label={currentPage - 1} currentPage={currentPage} />}
      {/*<PaginationDotsComponent />*/}
      {!lastPage && !firstPage &&
        <BasePaginationItem setPage={setPage} label={currentPage} currentPage={currentPage} />}
      {!lastPage && currentPage + 1 !== totalPages &&
        <BasePaginationItem setPage={setPage} label={currentPage + 1} currentPage={currentPage} />}
        {currentPage + 2 < totalPages && <span className="text-[#B1B1B1] mx-1">...</span>}
        <BasePaginationItem setPage={setPage} label={totalPages} currentPage={currentPage} extraClasses="" />
          <button onClick={() => { !lastPage ? setPage(currentPage + 1) : setPage(totalPages) }} className={`w-[46px] h-[44px] py-3 px-5 global-input-clip-path ${lastPage ? "" : "hover:bg-dynamicBlack duration-300 easy-in"}`}>
        <PaginationArrowRight fill={lastPage ? "fill-[#433F3F]" : "fill-white"} />
      </button>
        </div >) : (
          <>
      <button onClick={() => {}} className="w-[46px] h-[44px] py-3 px-5 global-input-clip-path">
        <PaginationArrowLeft fill="fill-[#433F3F]" />
      </button>
          <BasePaginationItem setPage={setPage} label={1} currentPage={currentPage} extraClasses="pt-[10px] hover:bg-transparent" />
      <button onClick={() => {}} className="w-[46px] h-[44px] py-3 px-5 global-input-clip-path">
        <PaginationArrowRight fill="fill-[#433F3F]" />
      </button>
        </>)}
      </>
  );
};

export default BasePagination;