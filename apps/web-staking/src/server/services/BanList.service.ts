import BanListModel from "../models/banList.schema";
import IBanList from "../types/IBanList";
import { executeQuery } from "./Database.service";

export async function getBannedWords(): Promise<string[]> {

  try {
    const bannedWords = await executeQuery(BanListModel.find({}).select('bannedWord').lean()) as IBanList[];

    return bannedWords.map((b) => b.bannedWord);

  } catch (error) {
    throw new Error(`Error @getBannedWords: ${error}`);
  }

}
