import EditDetailsComponent from "@/app/components/editDetails/EditDetailsComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Details",
  description: "Xai App Edit Details"
};

const EditDetails = () => {
  return (
    <div className="flex flex-col items-center">
      <EditDetailsComponent />
    </div>
  );
};

export default EditDetails;
