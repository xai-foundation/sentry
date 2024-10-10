import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title AchievementsFactory Tests
 */
export function AchievementsFactoryTests(deployInfrastructure) {

    const baseURI = "https://metadata.xai.com/";

    return function() {
    
        it("should check that AchievementsFactory contract deployed correctly", async function() {
            const {achievementsFactory} = await loadFixture(deployInfrastructure);

            const productionCount = 0;
            expect(productionCount).to.equal(0);
        });

        it("should produce a new ERC1155 token contract from the AchievementsFactory", async function() {
            const {achievementsFactory, addr1} = await loadFixture(deployInfrastructure);

            const trx = await achievementsFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();

            expect(rec.logs[0].fragment.name).to.equal("ContractProduced");
            expect(rec.logs[0].args[1]).to.equal(await addr1.getAddress());
        });

        it("should create a new token type on contract produced by the AchievementsFactory", async function() {
            const {
                AchievementsFactoryContractFactory, 
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const trx = await achievementsFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();

            //create new token type on token contract
            const tokenContractAddress = rec.logs[0].args[0];
            const tokenContract = await AchievementsFactoryContractFactory.attach(tokenContractAddress);
            // let trx2 = await tokenContract.defineToken();
            // let rec2 = await trx2.wait()

            //TODO: assert contract state and events
        });

        it("should mint a new token on contract produced by the AchievementsFactory", async function() {
            const {
                AchievementsFactoryContractFactory, 
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const trx = await achievementsFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();

            //create new token type on token contract
            const tokenContractAddress = rec.logs[0].args[0];
            const tokenContract = await AchievementsFactoryContractFactory.attach(tokenContractAddress);
            // let trx2 = await tokenContract.defineToken();
            // let rec2 = await trx2.wait()

            //TODO: mint tokens of the newly created token type

            //TODO: assert contract state and events
        });

        //TODO: test upgrading

        // it("should ...", async function() {
        //     const {erc1155Factory} = await loadFixture(deployInfrastructure);s
        // });

    }
}