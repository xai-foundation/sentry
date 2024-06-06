import { IProject } from "./IProject";
import { IDBModel } from "./IDBModel";
import { ObjectId } from "mongoose";

export interface IUserProjectInfo extends IDBModel {
    walletAddress: string;
    project: IProject | ObjectId;
    lastRefillTimestamp: number;
    lastInteractionTimestamp: number;
    balanceWei: string;
};