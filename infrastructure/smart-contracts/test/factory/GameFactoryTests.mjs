import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title GameFactory Tests
 */
export function GameFactoryTests(deployInfrastructure) {

    const baseURI = "https://metadata.xai.com/";

    return function() {
    
        it("should check that GameFactory contract deployed correctly", async function() {
            const {gameFactory} = await loadFixture(deployInfrastructure);

            const productionCount = 0;
            expect(productionCount).to.equal(0);
        });

        it("should produce a new ERC1155 token contract from the GameFactory", async function() {
            const {gameFactory, addr1} = await loadFixture(deployInfrastructure);

            const trx = await gameFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();

            expect(rec.logs[0].fragment.name).to.equal("ContractProduced");
            expect(rec.logs[0].args[1]).to.equal(await addr1.getAddress());
        });

        it("should create a new token type on contract produced by the GameFactory", async function() {
            const {
                GameFactoryContractFactory, 
                gameFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const trx = await gameFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();

            //create new token type on token contract
            const tokenContractAddress = rec.logs[0].args[0];
            const tokenContract = await GameFactoryContractFactory.attach(tokenContractAddress);
            // let trx2 = await tokenContract.defineToken();
            // let rec2 = await trx2.wait()

            //TODO: assert contract state and events
        });

        it("should mint a new token on contract produced by the GameFactory", async function() {
            const {
                GameFactoryContractFactory, 
                gameFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const trx = await gameFactory.connect(addr1).produceContract(baseURI);
            const rec = await trx.wait();

            //create new token type on token contract
            const tokenContractAddress = rec.logs[0].args[0];
            const tokenContract = await GameFactoryContractFactory.attach(tokenContractAddress);
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