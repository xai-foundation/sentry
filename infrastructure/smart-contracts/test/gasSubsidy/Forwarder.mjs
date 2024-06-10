import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

const createSignature = async (signer, forwarderAddress, request) => {
    const { chainId } = await ethers.provider.getNetwork();

    const domain = {
        name: 'Forwarder',
        version: '1',
        chainId,
        verifyingContract: forwarderAddress
    };

    const types = {
        ForwardRequest: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "gas", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "data", type: "bytes" },
        ]
    };

    const signature = await signer.signTypedData(domain, types, request);
    return signature;
}

/**
 * @title XAI subsidy Forwarder Tests
 * @dev Implementation of the forwarder tests
 */
export function Forwarder(deployInfrastructure) {
    return function () {
        it("Forward meta transaction", async function () {
            const { addr1, addr2, forwarder, testReceiver } = await loadFixture(deployInfrastructure);

            // Create meta transaction request object
            //
            // This should perform the increaseCounter with the request.from wallet 
            // and not the wallet that pays the transaction fee for sending the transaction
            const request = {
                from: (await addr1.getAddress()),
                to: (await testReceiver.getAddress()),
                value: "0",
                gas: "1000000",
                nonce: "0", //Nonce for addr1
                data: "0xb49004e9", // keccak256("increaseCounter()")
            };

            // Create the EIP-712 typed data signature
            const signature = await createSignature(addr1, (await forwarder.getAddress()), request);

            // Expect the forward transaction to fail when the request.from is not the signer
            await expect(
                forwarder.connect(addr2).execute(
                    { ...request, from: (await addr2.getAddress()) },
                    signature
                )
            ).to.be.revertedWith("Invalid signature");

            // Get the current Receiver contract state counters
            const addr1Counter = await testReceiver.counters(await addr1.getAddress());
            const addr2Counter = await testReceiver.counters(await addr2.getAddress());

            // Get the current ETH balances
            const addr1ETHBalance = await ethers.provider.getBalance(await addr1.getAddress());
            const addr2ETHBalance = await ethers.provider.getBalance(await addr2.getAddress());

            // Call the forwarder execute 
            await forwarder.connect(addr2).execute(
                request,
                signature
            );

            const addr1CounterAfter = await testReceiver.counters(await addr1.getAddress());
            const addr2CounterAfter = await testReceiver.counters(await addr2.getAddress());

            const addr1ETHBalanceAfter = await ethers.provider.getBalance(await addr1.getAddress());
            const addr2ETHBalanceAfter = await ethers.provider.getBalance(await addr2.getAddress());

            // Verify that the counter only increased for the request.from wallet that signed the request
            expect(addr1Counter + 1n).equal(addr1CounterAfter);
            // Verify that the counter stayed the same for the wallet that sent the transaction
            expect(addr2Counter).equal(addr2CounterAfter);

            // Verify that the ETH balance stayed the same for the request.from wallet that signed the request
            expect(addr1ETHBalance).equal(addr1ETHBalanceAfter);
            // Verify that the ETH balance is less for the wallet that sent the transaction
            expect(addr2ETHBalanceAfter).lessThan(addr2ETHBalance);

            // Verify that the same signature cannot me used again
            await expect(
                forwarder.connect(addr2).execute(
                    request,
                    signature
                )
            ).to.be.revertedWith("Invalid signature");

        })
    }
}
