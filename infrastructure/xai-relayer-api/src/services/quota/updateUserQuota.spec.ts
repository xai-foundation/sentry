import ProjectModel from "@/models/Project.schema";
import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import UserProjectInfoModel from "@/models/UserProjectInfo.schema";
import { updateUserQuota } from "./updateUserQuota";
import { Quota } from "@/models/types/Quota";
import { getUserQuota } from "./getUserQuota";

const expect = chai.expect;

const PROJECT_REFILL_LIMIT = (1 * 10 ** 17).toString()
const PROJECT_REFILL_INTERVAL = 30 * 60 * 1000
const PROJECT_USER_REFILL_LIMIT = (1 * 10 ** 16).toString()
const PROJECT_USER_REFILL_INTERVAL = 30 * 60 * 1000

describe("updateUserQuota", () => {
    let mongoServer: MongoMemoryServer;
    let TEST_PROJECT_ID: string;

    before(async function () {
        this.timeout(10000); // Increase timeout to 10 seconds for this hook

        // Set the strictQuery option to suppress console warning.
        mongoose.set("strictQuery", true);

        // Setup MongoDB Memory Server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        const newProject = new ProjectModel({
            name: "UpdateUserQuota 1",
            forwarderAddress: "0x0000000000000000000000000000000000000000",
            relayerId: "xxxxx-xxxxx-xxxxx-xxxxx-xxxxx",
            backendWallet: "0x0000000000000000000000000000000000000003",
            lastRefillTimestamp: Date.now(),
            refillInterval: PROJECT_REFILL_INTERVAL,
            projectLimitWei: PROJECT_REFILL_LIMIT,
            projectBalanceWei: PROJECT_REFILL_LIMIT,
            userLimitWei: PROJECT_USER_REFILL_LIMIT,
            userRefillInterval: PROJECT_USER_REFILL_INTERVAL,
        });

        await newProject.save();
        TEST_PROJECT_ID = newProject._id;
    });

    after(async () => {
        // Disconnect from the in-memory database
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it("should update the user quota", async () => {
        const TEST_WALLET = "0x0000000000000000000000000000000000000002";

        const newUserToProject = new UserProjectInfoModel({
            walletAddress: TEST_WALLET,
            project: TEST_PROJECT_ID,
            lastRefillTimestamp: Date.now(),
            lastInteractionTimestamp: Date.now(),
            balanceWei: PROJECT_USER_REFILL_LIMIT,
        });
        await newUserToProject.save();
        
        const diffFromRecentRefill = (Date.now() - newUserToProject.lastRefillTimestamp) % PROJECT_USER_REFILL_INTERVAL;
        const balanceReduceAmount = BigInt((5 * 10 ** 15));
        const quotaToUpdate: Quota = {
            balanceWei: balanceReduceAmount.toString(),
            nextRefillTimestamp: Date.now() + (PROJECT_USER_REFILL_INTERVAL - diffFromRecentRefill),
            nextRefillAmountWei: (BigInt(newUserToProject.balanceWei) - BigInt(balanceReduceAmount)).toString(),
            lastRefillTimestamp: newUserToProject.lastRefillTimestamp
        }

        await updateUserQuota(newUserToProject._id, TEST_PROJECT_ID, TEST_WALLET, quotaToUpdate);

        const updatedUser = await UserProjectInfoModel.findOne(
            { walletAddress: TEST_WALLET, project: TEST_PROJECT_ID }
        )

        expect(updatedUser.balanceWei).equal(balanceReduceAmount);
        expect(updatedUser.lastInteractionTimestamp).to.be.closeTo(Date.now(), 100);
        expect(updatedUser.lastRefillTimestamp).to.be.closeTo(newUserToProject.lastRefillTimestamp, 100);

    });
});