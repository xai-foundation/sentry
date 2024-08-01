import React from "react";

const SortArrowDown = ({ extraClasses }: { extraClasses?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={extraClasses} width="16" height="16" viewBox="0 0 16 16"
         fill="none">
      <path d="M7 0V12.175L1.4 6.575L0 8L8 16L16 8L14.6 6.575L9 12.175V0H7Z" fill="#F7F6F6" />
    </svg>
  );
};

export default SortArrowDown;