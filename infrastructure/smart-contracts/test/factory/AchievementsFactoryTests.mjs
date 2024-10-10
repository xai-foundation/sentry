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
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            const trx = await achievementsFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[0].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);

            expect(rec.logs[0].fragment.name).to.equal("ContractProduced");
            expect(rec.logs[0].args[1]).to.equal(await addr1.getAddress());
            expect(baseURI).to.equal(await tokenContract.uri(0));
        });

        it("should mint a new token on contract produced by the AchievementsFactory", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const trx = await achievementsFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[0].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //mint tokens of the newly created token type
            const toAddress = await addr1.getAddress();
            const tokenId = 0;
            const amount = 1;
            const data = "0x";
            let trx2 = await tokenContract.connect(addr1).mint(toAddress, tokenId, amount, data);
            let rec2 = await trx2.wait()

            //assert contract state and events
            expect(rec2.logs[0].fragment.name).to.equal("TransferSingle");
            expect(rec2.logs[0].args[0]).to.equal(toAddress);
            expect(rec2.logs[0].args[1]).to.equal(ethers.ZeroAddress);
            expect(rec2.logs[0].args[2]).to.equal(toAddress);
            expect(rec2.logs[0].args[3]).to.equal(tokenId);
            expect(rec2.logs[0].args[4]).to.equal(amount);
        });

        //TODO: test upgrading

        // it("should ...", async function() {
        //     const {erc1155Factory} = await loadFixture(deployInfrastructure);s
        // });

    }
}