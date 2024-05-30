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
    <div>
      <span className="block">{title}</span>
      <span className="block text-lg font-bold">{content}</span>
    </div>
  );
};

export default PoolStakingInfoChild;
