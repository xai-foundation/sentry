import CreatePoolComponent from "@/app/components/createPool/CreatePoolComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Pool",
  description: "Xai App Create Pool"
};

const CreatePool = () => {
  return (
    <div className="flex flex-col items-center">
      <CreatePoolComponent />
    </div>
  );
};

export default CreatePool;
