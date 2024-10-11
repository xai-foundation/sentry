import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title AchievementsFactory Tests
 */
export function AchievementsFactoryTests(deployInfrastructure) {

    const baseURI = "https://metadata.xai.com/";
    const mintRoleHash = "0x154c00819833dac601ee5ddded6fda79d9d8b506b911b3dbd54cdb95fe6c3686";
    const adminRoleHash = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";

    return function() {
    
        it("should check that AchievementsFactory contract deployed correctly", async function() {
            const {
                achievementsFactory, 
                addr1,
                addr2
            } = await loadFixture(deployInfrastructure);

            //set constants
            const productionCount = 0;
            const minter = await addr1.getAddress();
            const notMinter = await addr2.getAddress();

            //assert contract state
            expect(productionCount).to.equal(0);
            expect(await achievementsFactory.hasRole(mintRoleHash, minter)).to.equal(true);
            expect(await achievementsFactory.hasRole(mintRoleHash, notMinter)).to.equal(false);
            expect(await achievementsFactory.hasRole(adminRoleHash, minter)).to.equal(true);
            expect(await achievementsFactory.hasRole(adminRoleHash, notMinter)).to.equal(false);
            expect(await achievementsFactory.getRoleAdmin(mintRoleHash)).to.equal(adminRoleHash);
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
            const tokenContractAddress = rec.logs[0].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);

            //assert contract state and events
            expect(rec.logs[0].fragment.name).to.equal("ContractProduced");
            expect(rec.logs[0].args[1]).to.equal(gameId);
            expect(rec.logs[0].args[2]).to.equal(await addr1.getAddress());
            expect(baseURI).to.equal(await tokenContract.uri(0));
            expect(await tokenContract.factoryAddress()).to.equal(await achievementsFactory.getAddress());
            expect(await achievementsFactory.productionCount()).to.equal(1);
            expect(await achievementsFactory.contractsById(gameId)).to.equal(await tokenContract.getAddress());
        });

        it("should fail to produce multiple token contracts with the same gameId", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);

            //attempt to transfer newly minted token to another address
            await expect(
				achievementsFactory.connect(addr1).produceContract(gameId, baseURI)
			).to.be.revertedWith("game id already exists");
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
            const tokenContractAddress = rec.logs[0].args[0];
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
            expect(await tokenContract.tokenIdCount()).to.equal(1);
            expect(await tokenContract.totalSupply()).to.equal(1);
            expect(await tokenContract.totalSupplyById(tokenId)).to.equal(1);
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
            const tokenContractAddress = rec.logs[0].args[0];
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
            expect(await tokenContract.tokenIdCount()).to.equal(tokenIds.length);
            expect(await tokenContract.totalSupply()).to.equal(tokenIds.length);
            for (let  i = 0; i < tokenIds.length; i++) {
                expect(rec2.logs[0].args[3][i]).to.equal(tokenIds[i].toString());
                expect(rec2.logs[0].args[4][i]).to.equal("1");
                expect(await tokenContract.balanceOf(toAddress, tokenIds[i])).to.equal(1);
                expect(await tokenContract.totalSupplyById(tokenIds[i])).to.equal(1);
            }
        });

        it("should fail to mint tokens from address without MINT_ROLE", async function() {
            const {
                achievementsFactory, 
                addr1,
                addr2
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[0].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //mint initial token
            const toAddress = await addr1.getAddress();
            const tokenId = 0;
            const data = "0x";

            //attempt to mint token without MINT_ROLE auth
            await expect(
				tokenContract.connect(addr2).mint(toAddress, tokenId, data)
			).to.be.revertedWith("caller does not have MINT_ROLE");

            //attempt to batch mint token without MINT_ROLE auth
            const tokenIds = [tokenId];
            await expect(
				tokenContract.connect(addr2).mintBatch(toAddress, tokenIds, data)
			).to.be.revertedWith("caller does not have MINT_ROLE");
        });

        it("should assign MINT_ROLE to new address and successfully mint", async function() {
            const {
                achievementsFactory, 
                addr1,
                addr2
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[0].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);

            //assign MINT_ROLE to new account
            const newMinterAddress = await addr2.getAddress();
            await achievementsFactory.connect(addr1).grantRole(mintRoleHash, newMinterAddress);
            
            //mint tokens as new minter account
            const toAddress = await addr1.getAddress();
            const tokenId = 0;
            const data = "0x";
            let trx2 = await tokenContract.connect(addr2).mint(toAddress, tokenId, data);
            let rec2 = await trx2.wait();

            //assert contract state and events
            expect(rec2.logs[0].fragment.name).to.equal("TransferSingle");
            expect(rec2.logs[0].args[0]).to.equal(newMinterAddress);
            expect(rec2.logs[0].args[1]).to.equal(ethers.ZeroAddress);
            expect(rec2.logs[0].args[2]).to.equal(toAddress);
            expect(rec2.logs[0].args[3]).to.equal(tokenId);
            expect(rec2.logs[0].args[4]).to.equal(1);
            expect(await tokenContract.balanceOf(toAddress, tokenId)).to.equal(1);
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
            const tokenContractAddress = rec.logs[0].args[0];
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

            //attempt to batch mint multiple tokens with same tokenid
            const unmintedTokenId = 1;
            const duplicateTokenIds = [unmintedTokenId, unmintedTokenId];
            await expect(
				tokenContract.connect(addr1).mintBatch(toAddress, duplicateTokenIds, data)
			).to.be.revertedWith("address has non-zero token balance");
        });

        it("should get all defined token ids on contract produced by AchievementsFactory", async function() {
            const {
                achievementsFactory, 
                addr1
            } = await loadFixture(deployInfrastructure);

            //produce new token contract
            const gameId = "test-game-id";
            const trx = await achievementsFactory.connect(addr1).produceContract(gameId, baseURI);
            const rec = await trx.wait();
            const tokenContractAddress = rec.logs[0].args[0];
            const AchievementsContractFactory = await ethers.getContractFactory("Achievements");
            const tokenContract = await AchievementsContractFactory.attach(tokenContractAddress);
            
            //batch mint tokens
            const toAddress = await addr1.getAddress();
            const tokenIds = [1n, 2n, 3n, 4n, 5n];
            const data = "0x";
            await tokenContract.connect(addr1).mintBatch(toAddress, tokenIds, data);

            //get defined token ids
            const tokenIdList = await tokenContract.getDefinedTokens();
            const pageStart = 1;
            const pageEnd = 3;
            const tokenIdPage = await tokenContract.getDefinedTokens(pageStart, pageEnd);

            //assert contract state and events
            for (let i = 0; i < tokenIds.length; i++) {
                expect(tokenIdList[i]).to.equal(tokenIds[i]);
            }
            for (let i = 0; i < tokenIdPage.length; i++) {
                expect(tokenIdPage[i]).to.equal(tokenIds[i + pageStart]);
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
            const tokenContractAddress = rec.logs[0].args[0];
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

        //TODO: test upgrading

    }
}