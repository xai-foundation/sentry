# Smart Contract Testing

## Introduction

The smart contract test suite details are outlined below:

The entry point for the test cases is the Fixture.mjs file located in the test directory. All tests begin with this file.

## Setup

The fixture file goes through the process of "resetting" the state of the local test blockchain before each test is run.

This includes deploying all contracts, and following up with all upgrades that have been deployed.

At the end of the fixture file an object is returned with all of the objects/contracts/signers etc that are needed to run the tests.

```javascript

        // Note the contracts that have been upgraded are referencing the upgraded version(s)
        return {
            deployer,
            challenger,
            fundsReceiver,
            refereeDefaultAdmin,
            kycAdmin,
            xaiDefaultAdmin,
            xaiMinter,
            esXaiDefaultAdmin,
            esXaiMinter,
            gasSubsidyDefaultAdmin,
            gasSubsidyTransferAdmin,
            nodeLicenseDefaultAdmin,
            addr1,
            addr2,
            addr3,
            addr4,
            operator,
            rollupController,
            tiers,
            secretKeyHex,
            publicKeyHex: "0x" + publicKeyHex,
            referee: referee9,
            nodeLicense: nodeLicense8,
            poolFactory: poolFactory2,
            gasSubsidy,
            esXai: esXai2,
            xai,
            rollupContract
        }
```

Below that, you'll see the individual tests that reference all of the different test files. Each test receives the "deployInfrastructure" as a param. The deployInfrastructure object makes all of the objects/contracts/signers available in the test files.

``` javascript
  describe("Xai", XaiTests(deployInfrastructure).bind(this));
  describe("EsXai", esXaiTests(deployInfrastructure).bind(this));
  describe("Node License", NodeLicenseTests(deployInfrastructure).bind(this));
  describe("Referee", RefereeTests(deployInfrastructure).bind(this));
```

## Running the tests

In order to run the tests you must ensure everything has been installed and built properly.

1. Confirm that you have a .env with a valid MNEMONIC.
2. From the root directory run `pnpm install`
3. Tests will use core, so core has to be built locally with `pnpm -filter @sentry/core run build`.
5. Update the `hardhat.config.cjs` file. Change the default network to use `hardhat` instead of the current `arbitrumOne`.
6. Inside of `infrastructure/smart-contacts`, run `pnpm local` to start a local hardhat node.
7. Open a second terminal/command prompt and CD into `infrastructure/smart-contacts`
8. Run `pnpm test` to run the test suite.

## Adding New Tests

Tests for new functionality should have new files/folders created and then those test functions should be called from the main Fixture.mjs file.

## Adding Contracts

When a contract is added , you will need to update the Fixture.mjs file to include the deployment of your new contract. You should also add it to the return object at the end of the file so that it may be consumed in other test files.

## Upgrading Contracts

When a contract is upgraded, you will need to update the Fixture.mjs file to include the upgrade of your new contract. You should also update the return object at the end of the file for the new upgraded contract so that it may be consumed in the other test files.

## Test Considerations

Tests that require challenge submissions/assertions/claims have a few special considerations that need to be accounted for.

1. You must submit an initial challenge before creating a stake pool, or the stake pool creation will fail due to subtraction overflow with the challenge number being 0.
2. Tests that expect "winning keys". If you're testing a submit/claim process, you need to ensure that your submission includes enough "keys" to ensure a winner.
   - If you submit a challenge with only 10 keys and a 100 boost factor, it will only "win" 0.1% of the time. If your test is expecting "winning keys" it will fail most of the time.
   - Summary is, if your test expects "winning keys" you need to ensure you provide a high enough probability to ensure a winner.
   - Probability is determined by the total number of keys being submitted for multiplied by the percentage chance of each key winning(Boost Factor 100=1% etc..)
3. If you want to test "claiming" you need to submit a second challenge to close the first challenge making it "claimable".

## Starting State
The state at the end of the fixture/beginning of the tests:

    - Address 1 Has
      - 1 Node License
      - Passed KYC

    - Address 2 Has
      - 10 Node Licenses
      - Passed KYC

    - Address 3 Has
      - 1 Node License
      - HAS NOT Passed KYC


### Time Considerations

If you need to account for time/delays in your tests, use the following format:
```javascript
	// Wait 45 days
	await ethers.provider.send("evm_increaseTime", [86400 * 45]);
	await ethers.provider.send("evm_mine");
```

### Util Functions

There are some functions in the utils folder to help simplify required repetitive tasks.

1. *Create Pool* - can be used to create a stake pool.
2. *Get Winning Key Count Local* - this is a local implementation of the Referee getWinningKeyCountFunction. We use this in lieu of calling the referee contract as it is much faster.
3. *Mint Licenses* - this has two functions to either mint a single license or mint batched licenses. Both return the key Ids minted.
4. *Submit Test Challenge* - this can be used to submit test challenges. 
  - For test challenges, typically a generic state root may be used `0x0000000000000000000000000000000000000000000000000000000000000000` **UNLESS** you are actually testing the confirm data.


### Deprecated Tests

There are some tests in the Referee that are commented out because they are no longer compatible with the new referee. 
They are:

- `The Referee should allow users to stake in V1`
- `Check that reward chance increases with higher staking amount`
