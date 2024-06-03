import { IDocument } from "./IModel";

export default interface IGameStudio extends IDocument {
    name: string;
    forwarderAddress: string;
    receiverAddress: string;
    relayerId: string;
    refillTimestamp: Date;
    refillInterval: number;
    studioLimit: number;
    studioBalance: number;
    userLimit: number;
    userRefillInterval: number;
};