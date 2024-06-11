import UserProjectInfoModel from "@/models/UserProjectInfo.schema";
import { Types } from "mongoose";
import { Quota } from "@/models/types/Quota";

/**
 * Update the User to project balance and timestamps, create new if id is null
 * 
 * @param {ObjectId | null} userProjectId the userToProject document id, can be null if the user did not exist
 * @param {ObjectId | string} projectId the project Id
 * @param {string} walletAddress the user's walletAddress
 * @param {Quota} updatedQuota The updated quota object for the user
 */
export async function updateUserQuota(
    userProjectId: Types.ObjectId | null,
    projectId: Types.ObjectId | string,
    walletAddress: string,
    updatedQuota: Quota
): Promise<void> {

    if (userProjectId === null) {
        const newUserToProject = new UserProjectInfoModel({
            walletAddress,
            project: projectId,
            lastRefillTimestamp: updatedQuota.lastRefillTimestamp,
            lastInteractionTimestamp: Date.now(),
            balanceWei: updatedQuota.balanceWei,
        });
        await newUserToProject.save();
        return;
    }

    try {
        await UserProjectInfoModel.updateOne(
            { _id: userProjectId },
            {
                balanceWei: updatedQuota.balanceWei,
                lastRefillTimestamp: updatedQuota.lastRefillTimestamp,
                lastInteractionTimestamp: Date.now(),
            }
        );
    } catch (error) {
        throw new Error(`Internal error - failed to update user quota`);
    }
}
