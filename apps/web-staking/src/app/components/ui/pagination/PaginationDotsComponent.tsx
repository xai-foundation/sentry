import React from "react";
import { Tooltip } from "@/app/components/ui";

interface PaginationDotsComponentProps {

}

const PaginationDotsComponent = () => {
  return (
    <span>
      <Tooltip content={"test"}>
        ...
      </Tooltip>
    </span>
  );
};

export default PaginationDotsComponent;