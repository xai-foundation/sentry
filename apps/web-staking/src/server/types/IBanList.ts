import { IDocument } from "./IModel";

export default interface IBanList extends IDocument {
  bannedWord: string;
}
