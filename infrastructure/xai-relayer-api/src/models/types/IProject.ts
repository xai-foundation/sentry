import { IDBModel } from "./IDBModel";

export interface IProject extends IDBModel {
    name: string;
    forwarderAddress: string;
    relayerId: string;
    backendWallet: string;
    lastRefillTimestamp: number;
    refillInterval: number;
    projectLimitWei: string;
    projectBalanceWei: string;
    userLimitWei: string;
    userRefillInterval: number;
};