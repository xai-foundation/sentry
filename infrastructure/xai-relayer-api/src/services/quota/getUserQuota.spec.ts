import ProjectModel from "@/models/Project.schema";
import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { getUserQuota } from "./getUserQuota";
import UserProjectInfoModel from "@/models/UserProjectInfo.schema";

const expect = chai.expect;

const PROJECT_USER_REFILL_LIMIT = (1 * 10 ** 16).toString() //0.01 XAI
const PROJECT_USER_REFILL_INTERVAL = 30 * 60 * 1000 //30 min

describe("getUserQuota", () => {
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
            name: "GetUserQuotaTest 1",
            forwarderAddress: "0x0000000000000000000000000000000000000000",
            relayerId: "xxxxx-xxxxx-xxxxx-xxxxx-xxxxx",
            backendWallet: "0x0000000000000000000000000000000000000000",
            lastRefillTimestamp: Date.now(),
            refillInterval: 30 * 60 * 1000,
            projectLimitWei: (1 * 10 ** 17).toString(),
            projectBalanceWei: (1 * 10 ** 17).toString(),
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

    it("should get the users quota for a project", async () => {
        const userQuota = await getUserQuota(TEST_PROJECT_ID, "0x0000000000000000000000000000000000000001")

        expect(userQuota).to.exist;
        expect(userQuota.quota.balanceWei).equal(PROJECT_USER_REFILL_LIMIT);
        expect(userQuota.quota.nextRefillAmountWei).equal("0");
        expect(userQuota.quota.nextRefillTimestamp).to.be.closeTo(Date.now() + PROJECT_USER_REFILL_INTERVAL, 100);
        expect(userQuota.quota.lastRefillTimestamp).to.be.closeTo(Date.now(), 100);
    });

    it("should get the correct quota after refill", async () => {

        const TEST_WALLET = "0x0000000000000000000000000000000000000002";
        const balanceReduceAmount = BigInt((5 * 10 ** 15));

        const newUserToProject = new UserProjectInfoModel({
            walletAddress: TEST_WALLET,
            project: TEST_PROJECT_ID,
            lastRefillTimestamp: Date.now(),
            lastInteractionTimestamp: Date.now(),
            balanceWei: PROJECT_USER_REFILL_LIMIT,
        });
        await newUserToProject.save();

        //Get current quota
        const userQuota = await getUserQuota(TEST_PROJECT_ID, TEST_WALLET);
        expect(userQuota).to.exist;
        expect(userQuota.quota.balanceWei).equal(PROJECT_USER_REFILL_LIMIT);
        expect(userQuota.quota.nextRefillAmountWei).equal("0");
        expect(userQuota.quota.nextRefillTimestamp).to.be.closeTo(Date.now() + PROJECT_USER_REFILL_INTERVAL, 100);
        expect(userQuota.quota.lastRefillTimestamp).to.be.closeTo(Date.now(), 100);

        //Update userProject, reduce balance
        await UserProjectInfoModel.updateOne(
            { walletAddress: TEST_WALLET, project: TEST_PROJECT_ID },
            {
                balanceWei: (BigInt(userQuota.quota.balanceWei) - BigInt((balanceReduceAmount))).toString(),
            }
        )

        const userQuotaReducedBalance = await getUserQuota(TEST_PROJECT_ID, TEST_WALLET);
        expect(userQuotaReducedBalance.quota.balanceWei).equal((BigInt(userQuota.quota.balanceWei) - BigInt((balanceReduceAmount))).toString());
        expect(userQuotaReducedBalance.quota.nextRefillAmountWei).equal((BigInt(PROJECT_USER_REFILL_LIMIT) - BigInt((userQuotaReducedBalance.quota.balanceWei))).toString());
        expect(userQuotaReducedBalance.quota.nextRefillTimestamp).to.be.closeTo(userQuotaReducedBalance.quota.lastRefillTimestamp + PROJECT_USER_REFILL_INTERVAL, 100); //100 ms diff
        expect(userQuotaReducedBalance.quota.lastRefillTimestamp).equal(userQuota.quota.lastRefillTimestamp);

        //Update userProject, set lastRefill further than interval

        const updatedLastRefill = Date.now() - (PROJECT_USER_REFILL_INTERVAL + 1000);
        await UserProjectInfoModel.updateOne(
            { walletAddress: TEST_WALLET, project: TEST_PROJECT_ID },
            {
                lastRefillTimestamp: updatedLastRefill,
            }
        );

        const userQuotaExpectedRefill = await getUserQuota(TEST_PROJECT_ID, TEST_WALLET);
        expect(userQuotaExpectedRefill.quota.balanceWei).equal(PROJECT_USER_REFILL_LIMIT);
        expect(userQuotaExpectedRefill.quota.nextRefillAmountWei).equal("0");

        const diffFromRecentRefill = (Date.now() - userQuotaExpectedRefill.quota.lastRefillTimestamp) % PROJECT_USER_REFILL_INTERVAL;
        expect(userQuotaExpectedRefill.quota.nextRefillTimestamp).to.be.closeTo(Date.now() + (PROJECT_USER_REFILL_INTERVAL - diffFromRecentRefill), 100); //100 ms diff
        expect(userQuotaExpectedRefill.quota.lastRefillTimestamp).to.be.closeTo(Date.now() - diffFromRecentRefill, 100); //100 ms diff
    });
});