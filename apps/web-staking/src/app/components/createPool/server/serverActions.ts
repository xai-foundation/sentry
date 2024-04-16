"use server";

import { getBannedWords } from "@/server/services/BanList.service";

export const getAllBanWords = async () => {
  const result = await getBannedWords();
  return result;
};
