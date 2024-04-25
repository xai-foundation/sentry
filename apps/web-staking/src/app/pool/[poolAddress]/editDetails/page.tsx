import EditDetailsComponent from "@/app/components/editDetails/EditDetailsComponent";
import { getBannedWords } from "@/server/services/BanList.service";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Edit Details",
  description: "Xai App Edit Details",
};

const EditDetails = async () => {
  let bannedWords: string[] = [];

  try {
    bannedWords = await getBannedWords();
  } catch (error) {
    console.error("Failed to load banned words", error);
  }

  return (
    <div className="flex flex-col items-center">
      <EditDetailsComponent bannedWords={bannedWords} />
    </div>
  );
};

export default EditDetails;
