import { Types } from "mongoose"

export interface IDBModel {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}