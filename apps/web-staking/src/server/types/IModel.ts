import { ObjectId } from "mongoose"

export interface IModel {
    _id: ObjectId
}

export interface IDocument extends IModel {
    createdAt: Date
}