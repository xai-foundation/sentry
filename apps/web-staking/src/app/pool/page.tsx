import React from "react";
import MyPoolComponent from "../components/pool/MyPoolComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Pools",
  description: "Xai App My Pools"
};

const MyPool = () => {
  return (
    <div className="flex w-full flex-col items-center lg:px-[150px]">
      <MyPoolComponent />
    </div>
  );
};

export default MyPool;
