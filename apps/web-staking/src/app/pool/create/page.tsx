import CreatePoolComponent from "@/app/components/createPool/CreatePoolComponent";
import { getBannedWords } from "@/server/services/BanList.service";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Create Pool",
  description: "Xai App Create Pool"
};

const CreatePool = async () => {
  let bannedWords: string[] = [];

  try {
    bannedWords = await getBannedWords();
  } catch (error) {
    console.error("Failed to load banned words", error);
  }

  return (
    <div className="flex flex-col items-center">
      <CreatePoolComponent bannedWords={bannedWords} />
    </div>
  );
};

export default CreatePool;
