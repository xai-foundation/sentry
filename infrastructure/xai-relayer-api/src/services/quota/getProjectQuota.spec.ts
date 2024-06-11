import ProjectModel from "@/models/Project.schema";
import chai from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { getProjectQuota } from "./getProjectQuota";

const expect = chai.expect;

const PROJECT_REFILL_LIMIT = (1 * 10 ** 17).toString()
const PROJECT_REFILL_INTERVAL = 30 * 60 * 1000

describe("getProjectQuota", () => {
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
            name: "GetProjectQuota 1",
            forwarderAddress: "0x0000000000000000000000000000000000000000",
            relayerId: "xxxxx-xxxxx-xxxxx-xxxxx-xxxxx",
            backendWallet: "0x0000000000000000000000000000000000000001",
            lastRefillTimestamp: Date.now(),
            refillInterval: PROJECT_REFILL_INTERVAL,
            projectLimitWei: PROJECT_REFILL_LIMIT,
            projectBalanceWei: PROJECT_REFILL_LIMIT,
            userLimitWei: (1 * 10 ** 16).toString(),
            userRefillInterval: 30 * 60 * 1000,
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

    it("should get the projects quota", async () => {
        const projectQuota = await getProjectQuota(TEST_PROJECT_ID);

        expect(projectQuota).to.exist;
        expect(projectQuota.balanceWei).equal(PROJECT_REFILL_LIMIT);
        expect(projectQuota.nextRefillAmountWei).equal("0");
        expect(projectQuota.nextRefillTimestamp).to.be.closeTo(Date.now() + PROJECT_REFILL_INTERVAL, 100);
    });

    it("should get the correct quota after refill", async () => {

        const balanceReduceAmount = BigInt((5 * 10 ** 15));

        //Get current quota
        const projectQuota = await getProjectQuota(TEST_PROJECT_ID);
        expect(projectQuota).to.exist;
        expect(projectQuota.balanceWei).equal(PROJECT_REFILL_LIMIT);
        expect(projectQuota.nextRefillAmountWei).equal("0");
        expect(projectQuota.nextRefillTimestamp).to.be.closeTo(Date.now() + PROJECT_REFILL_INTERVAL, 100);
        expect(projectQuota.lastRefillTimestamp).to.be.closeTo(Date.now(), 100);

        //Update userProject, reduce balance
        await ProjectModel.updateOne(
            { _id: TEST_PROJECT_ID },
            {
                projectBalanceWei: (BigInt(projectQuota.balanceWei) - BigInt((balanceReduceAmount))).toString(),
            }
        );

        const projectQuotaReducedBalance = await getProjectQuota(TEST_PROJECT_ID);
        expect(projectQuotaReducedBalance.balanceWei).equal((BigInt(projectQuota.balanceWei) - BigInt(balanceReduceAmount)).toString());
        expect(projectQuotaReducedBalance.nextRefillAmountWei).equal((BigInt(PROJECT_REFILL_LIMIT) - BigInt(projectQuotaReducedBalance.balanceWei)).toString());
        expect(projectQuotaReducedBalance.nextRefillTimestamp).to.be.closeTo(projectQuotaReducedBalance.lastRefillTimestamp + PROJECT_REFILL_INTERVAL, 100); //100 ms diff
        expect(projectQuotaReducedBalance.lastRefillTimestamp).equal(projectQuota.lastRefillTimestamp);

        //Update userProject, set lastRefill further than interval

        const updatedLastRefill = Date.now() - (PROJECT_REFILL_INTERVAL + 1);
        await ProjectModel.updateOne(
            { _id: TEST_PROJECT_ID },
            {
                lastRefillTimestamp: updatedLastRefill,
            }
        );

        const projectQuotaExpectedRefill = await getProjectQuota(TEST_PROJECT_ID);
        expect(projectQuotaExpectedRefill.balanceWei).equal(PROJECT_REFILL_LIMIT);
        expect(projectQuotaExpectedRefill.nextRefillAmountWei).equal("0");

        const diffFromRecentRefill = (Date.now() - projectQuotaExpectedRefill.lastRefillTimestamp) % PROJECT_REFILL_INTERVAL;
        expect(projectQuotaExpectedRefill.nextRefillTimestamp).to.be.closeTo(Date.now() + (PROJECT_REFILL_INTERVAL - diffFromRecentRefill), 100); //100 ms diff
        expect(projectQuotaExpectedRefill.lastRefillTimestamp).to.be.closeTo(Date.now() - diffFromRecentRefill, 100); //100 ms diff
        expect(projectQuota.lastRefillTimestamp).to.be.closeTo(Date.now(), 100);
    });
});