import { loadMongoose } from "@/loaders/mongoose";
import UserProjectInfoModel from "@/models/UserProjectInfo.schema";
import ProjectModel from "@/models/Project.schema";
import { Types, ObjectId } from "mongoose";
import { Quota } from "@/models/types/Quota";
import { IProject } from "@/models/types/IProject";
import { IUserProjectInfo } from "@/models/types/UserProjectInfo";


/**
 * ## Get a quote for a user in a project.
 * This will check if a refill would happen and will return the current useable amount.
 * 
 * @param {ObjectId | string} projectId The project Id
 * @param {string} walletAddress User wallet address
 * 
 * @returns {Quota} The quota info for the user to the given project
 * @returns {ProjectInfo} relayerId and forwarder and userToProjectId from the project to use it for forwarding
 */
export async function getUserQuota(
    projectId: ObjectId | string,
    walletAddress: string
): Promise<{ quota: Quota, projectInfo: { relayerId: string, forwarderAddress: string, userProjectId: Types.ObjectId | null } }> {

    await loadMongoose();

    let project: IProject | null
    let userProjectInfo: IUserProjectInfo | null

    try {
        project = await ProjectModel.findById(projectId)
            .select('userLimitWei userRefillInterval relayerId forwarderAddress')
            .lean()
            .exec() as IProject | null;
    } catch (error) {
        throw new Error(`Internal error - failed to load project`);
    }

    if (!project) {
        throw new Error(`Invalid Project`);
    }

    try {
        userProjectInfo = await UserProjectInfoModel.findOne({ walletAddress: walletAddress, project: projectId })
            .lean()
            .exec() as IUserProjectInfo | null;
    } catch (error) {
        throw new Error(`Internal error - failed to load user info`);
    }

    //If that user never used the subsidy for this project, return project's amounts
    if (!userProjectInfo) {
        return {
            quota: {
                balanceWei: project.userLimitWei,
                nextRefillTimestamp: Date.now() + project.userRefillInterval,
                nextRefillAmountWei: "0",
                lastRefillTimestamp: Date.now()
            },
            projectInfo: {
                relayerId: project.relayerId,
                forwarderAddress: project.forwarderAddress,
                userProjectId: null
            }
        }
    }

    let userQuota: Quota = {
        balanceWei: userProjectInfo.balanceWei,
        nextRefillTimestamp: userProjectInfo.lastRefillTimestamp + project.userRefillInterval,
        nextRefillAmountWei: (BigInt(project.userLimitWei) - BigInt(userProjectInfo.balanceWei)).toString(),
        lastRefillTimestamp: userProjectInfo.lastRefillTimestamp
    }

    const timeFromLastRefill = Date.now() - userProjectInfo.lastRefillTimestamp;

    if (timeFromLastRefill > project.userRefillInterval) {
        //No refill happened for longer than the interval
        //So we will show the amount and the timestamp from the most recent interval that could have happened
        const diffFromRecentRefill = timeFromLastRefill % project.userRefillInterval;

        userQuota.balanceWei = project.userLimitWei;
        userQuota.nextRefillTimestamp = Date.now() + (project.userRefillInterval - diffFromRecentRefill);
        userQuota.nextRefillAmountWei = "0";
        userQuota.lastRefillTimestamp = Date.now() - diffFromRecentRefill;
    }

    return {
        quota: userQuota,
        projectInfo: {
            relayerId: project.relayerId,
            forwarderAddress: project.forwarderAddress,
            userProjectId: userProjectInfo._id
        }
    };
}
