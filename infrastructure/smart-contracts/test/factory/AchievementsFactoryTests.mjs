import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title AchievementsFactory Tests
 */
export function AchievementsFactoryTests(deployInfrastructure) {

    const baseURI = "https://metadata.xai.com/";

    return function() {
    
        it("should check that AchievementsFactory contract deployed correctly", async function() {
            await loadFixture(deployInfrastructure);

            //assert contract state
            const productionCount = 0;
            expect(productionCount).to.equal(0);
        });

        it("should produce a new ERC1155 token contract from the AchievementsFactory", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[2].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);

            //assert contract state and events
            expect(rec.logs[2].fragment.name).to.equal("ContractProduced");
            expect(rec.logs[2].args[1]).to.equal(gameId);
            expect(rec.logs[2].args[2]).to.equal(await addr1.getAddress());
            expect(await achievementsFactory.getAddress()).to.equal(await tokenContract.owner());
            expect(baseURI).to.equal(await tokenContract.uri(0));
        });

        it("should mint a new token on contract produced by the AchievementsFactory", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[2].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //mint tokens
            const toAddress = await addr1.getAddress();
            const tokenId = 0;
            const data = "0x";
            let trx2 = await tokenContract.connect(addr1).mint(toAddress, tokenId, data);
            let rec2 = await trx2.wait();

            //assert contract state and events
            expect(rec2.logs[0].fragment.name).to.equal("TransferSingle");
            expect(rec2.logs[0].args[0]).to.equal(toAddress);
            expect(rec2.logs[0].args[1]).to.equal(ethers.ZeroAddress);
            expect(rec2.logs[0].args[2]).to.equal(toAddress);
            expect(rec2.logs[0].args[3]).to.equal(tokenId);
            expect(rec2.logs[0].args[4]).to.equal(1);
            expect(await tokenContract.balanceOf(toAddress, tokenId)).to.equal(1);
        });

        it("should batch mint new tokens on contract produced by the AchievementsFactory", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[2].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //batch mint tokens
            const toAddress = await addr1.getAddress();
            const tokenIds = [0, 1, 2];
            const data = "0x";
            let trx2 = await tokenContract.connect(addr1).mintBatch(toAddress, tokenIds, data);
            let rec2 = await trx2.wait();

            //assert contract state and events
            expect(rec2.logs[0].fragment.name).to.equal("TransferBatch");
            expect(rec2.logs[0].args[0]).to.equal(toAddress);
            expect(rec2.logs[0].args[1]).to.equal(ethers.ZeroAddress);
            expect(rec2.logs[0].args[2]).to.equal(toAddress);
            for (let  i = 0; i < tokenIds.length; i++) {
                expect(rec2.logs[0].args[3][i]).to.equal(tokenIds[i].toString());
                expect(rec2.logs[0].args[4][i]).to.equal("1");
                expect(await tokenContract.balanceOf(toAddress, tokenIds[i])).to.equal(1);
            }
        });

        it("should fail to transfer a token on contract produced by the AchievementFactory", async function() {
            const {
                achievementsFactory, 
                addr1,
                addr2
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[2].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //mint tokens of the newly created token type
            const toAddress = await addr1.getAddress();
            const tokenId = 0;
            const data = "0x";
            await tokenContract.connect(addr1).mint(toAddress, tokenId, data);

            //attempt to transfer newly minted token to another address
            await expect(
				tokenContract.connect(addr1).safeTransferFrom(
                    await addr1.getAddress(),
                    await addr2.getAddress(), 
                    tokenId, 
                    1, 
                    data
                )
			).to.be.revertedWith("not transferrable");

            await expect(
				tokenContract.connect(addr1).safeBatchTransferFrom(
                    await addr1.getAddress(),
                    await addr2.getAddress(), 
                    [tokenId], 
                    [1], 
                    data
                )
			).to.be.revertedWith("not batch transferrable");
        });

        it("should fail to mint more than one token of token id to account", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[2].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //mint initial token
            const toAddress = await addr1.getAddress();
            const tokenId = 0;
            const data = "0x";
            await tokenContract.connect(addr1).mint(toAddress, tokenId, data);

            //attempt to mint another token with same tokenid to same address
            await expect(
				tokenContract.connect(addr1).mint(toAddress, tokenId, data)
			).to.be.revertedWith("address has non-zero token balance");

            //attempt to batch mint another token with same tokenid to same address
            const tokenIds = [tokenId];
            await expect(
				tokenContract.connect(addr1).mintBatch(toAddress, tokenIds, data)
			).to.be.revertedWith("address has non-zero token balance");

            //attempt to batch mint another token with same tokenid to same address
            const unmintedTokenId = 1;
            const duplicateTokenIds = [unmintedTokenId, unmintedTokenId];
            await expect(
				tokenContract.connect(addr1).mintBatch(toAddress, duplicateTokenIds, data)
			).to.be.revertedWith("address has non-zero token balance");
        });

        //TODO: test upgrading

        // it("should ...", async function() {
        //     const {erc1155Factory} = await loadFixture(deployInfrastructure);s
        // });

    }
}