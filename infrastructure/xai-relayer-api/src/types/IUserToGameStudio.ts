import { IDocument } from "./IModel";

export default interface IUserToGameStudio extends IDocument {
    walletAddress: string;
    lastRefill: Date;
    lastInteraction: Date;
    balance: number;
};