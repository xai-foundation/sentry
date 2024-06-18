import React from "react";

interface PoolStakingInfoChildProps {
  title: string;
  content: string;
}

const PoolStakingInfoChild = ({
  title,
  content,
}: PoolStakingInfoChildProps) => {
  return (
    <div className="pb-[15px] mt-[15px]">
      <span className="block text-elementalGrey text-lg font-medium">{title}</span>
      <span className="block text-xl font-semibold">{content}</span>
    </div>
  );
};

export default PoolStakingInfoChild;
