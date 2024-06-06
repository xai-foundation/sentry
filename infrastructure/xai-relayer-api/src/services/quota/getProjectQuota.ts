import { loadMongoose } from "@/loaders/mongoose";
import ProjectModel from "@/models/Project.schema";
import { IProject } from "@/models/types/IProject";
import { Quota } from "@/models/types/Quota";
import { ObjectId } from "mongoose";

/**
 * ## Get a quote info for a project.
 * This will check if a refill would happen and will return the current useable amount.
 * 
 * @param {ObjectId | string} projectId The project Id
 * 
 * @returns {Quota} The quota info for the project
 */
export async function getProjectQuota(projectId: ObjectId | string): Promise<Quota> {
    await loadMongoose();

    let project: IProject | null

    try {
        project = await ProjectModel.findById(projectId)
            .select('lastRefillTimestamp refillInterval projectLimitWei projectBalanceWei')
            .exec() as IProject | null;
    } catch (error) {
        throw new Error(`Internal error - failed to load project`);
    }

    if (!project) {
        throw new Error(`Invalid Project`);
    }

    let projectQuota: Quota = {
        balanceWei: project.projectBalanceWei,
        nextRefillTimestamp: project.lastRefillTimestamp + project.refillInterval,
        nextRefillAmountWei: (BigInt(project.projectLimitWei) - BigInt(project.projectBalanceWei)).toString(),
        lastRefillTimestamp: project.lastRefillTimestamp
    }

    const timeFromLastRefill = Date.now() - project.lastRefillTimestamp;

    if (timeFromLastRefill > project.refillInterval) {
        //No refill happened for longer than the interval
        //So we will show the amount and the timestamp from the most recent interval that could have happened
        const diffFromRecentRefill = timeFromLastRefill % project.refillInterval;

        projectQuota.balanceWei = project.projectLimitWei;
        projectQuota.nextRefillAmountWei = "0";
        projectQuota.lastRefillTimestamp = Date.now() - diffFromRecentRefill;
        projectQuota.nextRefillTimestamp = Date.now() + (project.refillInterval - diffFromRecentRefill);
    }

    return projectQuota;
}
