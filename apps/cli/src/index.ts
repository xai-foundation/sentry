import { Command } from 'commander';
import inquirer from 'inquirer';
import { addAdmin } from './commands/access-control/add-admin.js';
import { syncStakingPools } from './commands/sync-staking-pools.js';
import { bootChallenger } from './commands/boot-challenger.js';
import { version, config, setConfigByChainId, MAINNET_ID, TESTNET_ID } from "@sentry/core";
import { processUnclaimedChallenges } from './commands/operator-control/process-unclaimed-challenges.js';
import { monitorNodeCreated } from './commands/monitor-node-created.js';
import { startCentralizationRuntime } from './commands/start-centralization-runtime.js';
import { addChallenger } from './commands/access-control/add-challenger.js';
import { addKycAdmin } from './commands/access-control/add-kyc-admin.js';
import { addOperator } from './commands/operator-control/add-operator.js';
import { addPromoCode } from './commands/licenses/add-promo-code.js';
import { bootOperator } from './commands/operator-control/operator-runtime.js';
import { changeWhitelistStatus } from './commands/xai-token/change-whitelist-status.js';
import { generateRevenueReport } from './commands/licenses/generate-revenue-report.js';
import { totalSupply } from './commands/xai-token/total-supply.js';
import { toggleAssertionChecking } from './commands/toggle-assertion-checking.js';
import { manuallyChallengeAssertion } from './commands/manually-challenge-assertion.js';
import { getPublicKeyFromPrivateKey } from './commands/get-public-key-from-private-key.js';
import { getListOfChallengers } from './commands/access-control/get-list-of-challengers.js';
import { removeKycAdmin } from './commands/access-control/remove-kyc-admin.js';
import { checkKycStatus } from './commands/kyc/check-kyc-status.js';
import { createBlsKeyPair } from './commands/create-bls-key-pair.js';
import { checkWhitelist } from './commands/xai-token/check-whitelist.js';
import { createMnemonic } from './commands/create-mnemonic.js';
import { getTotalSupplyAndCap } from './commands/licenses/get-total-supply-and-cap-of-licenses.js';
import { eventListener } from './commands/event-listener.js';
import { getAllContractAddresses } from './commands/get-contract-addresses.js';
import { getAssertionCheckingStatus } from './commands/get-assertion-checking-status.js';
import { getBalancesForAddresses } from './commands/xai-token/get-balances.js';
import { getListOfAdmins } from './commands/access-control/get-list-of-admins.js';
import { setRollupAddress } from './commands/set-rollup-address.js';
import { setOrAddPricingTiersCommand } from './commands/licenses/set-or-add-pricing-tiers.js';
import { getListOfKycAdmins } from './commands/access-control/get-list-of-kyc-admins.js';
import { getPriceForQuantity } from './commands/licenses/get-price-for-quantity.js';
import { getPrivateKeyFromMnemonic } from './commands/get-private-key-from-memonic.js';
import { getReferralDiscountAndRewardPercentages } from './commands/licenses/get-referral-discount-and-reward-percentages.js';
import { getReferralRewards } from './commands/licenses/get-referral-rewards.js';
import { listNodeLicenses } from './commands/licenses/list-node-licenses.js';
import { setReferralDiscountAndRewardPercentages } from './commands/licenses/set-referral-discount-and-reward-percentages.js';
import { setChallengerPublicKey } from './commands/set-challenger-public-key.js';
import { setKycStatus } from './commands/kyc/set-kyc-status.js';
import { listKycStatuses } from './commands/kyc/list-kyc-status.js';
import { listOperators } from './commands/operator-control/list-operators.js';
import { listTiers } from './commands/licenses/list-tiers.js';
import { mintNodeLicenses } from './commands/licenses/mint-node-licenses.js';
import { removeAdmin } from './commands/access-control/remove-admin.js';
import { removeChallenger } from './commands/access-control/remove-challenger.js';
import { removeOperator } from './commands/operator-control/remove-operator.js';
import { removePromoCode } from './commands/licenses/remove-promo-code.js';
import { displayNodeAgreement } from './commands/display-node-agreement.js';
import { exportChallengeInfo } from './commands/export-challenge-info.js';
import { startKycProcess } from './commands/kyc/start-kyc-process.js';

const cli = new Command();

// entrypoints to each of the commands
cli
    .name('sentry-node')
    .description('CLI for managing the Sentry Node ecosystem')
    .version(version);
addAdmin(cli);
addChallenger(cli);
addKycAdmin(cli);
addOperator(cli);
addPromoCode(cli);
bootChallenger(cli);
bootOperator(cli);
changeWhitelistStatus(cli);
checkKycStatus(cli);
checkWhitelist(cli);
createBlsKeyPair(cli);
createMnemonic(cli);
eventListener(cli);
getAllContractAddresses(cli);
getAssertionCheckingStatus(cli);
getBalancesForAddresses(cli);
getListOfAdmins(cli);
getListOfChallengers(cli);
getListOfKycAdmins(cli);
getPriceForQuantity(cli);
getPrivateKeyFromMnemonic(cli);
getPublicKeyFromPrivateKey(cli);
getReferralDiscountAndRewardPercentages(cli);
getReferralRewards(cli);
getTotalSupplyAndCap(cli);
listKycStatuses(cli);
listNodeLicenses(cli);
listOperators(cli);
listTiers(cli);
manuallyChallengeAssertion(cli);
mintNodeLicenses(cli);
removeAdmin(cli);
removeChallenger(cli);
removeKycAdmin(cli);
removeOperator(cli);
removePromoCode(cli);
setChallengerPublicKey(cli);
setKycStatus(cli);
setOrAddPricingTiersCommand(cli);
setReferralDiscountAndRewardPercentages(cli);
setRollupAddress(cli);
toggleAssertionChecking(cli);
totalSupply(cli);
generateRevenueReport(cli);
displayNodeAgreement(cli);
startCentralizationRuntime(cli);
exportChallengeInfo(cli);
syncStakingPools(cli);
monitorNodeCreated(cli);
processUnclaimedChallenges(cli);
startKycProcess(cli);

// Default action if no command is specified
cli.action(async () => {
    console.log("No command specified. Use --help to see available commands.");

    // Interactive prompt loop
    while (true) {
        const { command } = await inquirer.prompt([
            {
                type: 'input',
                name: 'command',
                message: 'Enter a command:',
            }
        ]);

        if (command === 'exit' || command === 'quit') {
            console.log('Exiting...');
            process.exit(0);
        }

        // Show help message if the user asks for it
        if (command === 'help' || command === '--help') {
            cli.outputHelp();
            continue;
        }
        
        // DEV MODE - toggle network switch for using sepolia config
        if (command === 'toggle-switch-network') {
            if(config.defaultNetworkName === "arbitrum"){
                console.log("==========================================================")
                console.log("DEV MODE - SWITCHED TO TESTNET !");
                console.log("YOU CANNOT EARN ANY REWARDS WHEN RUNNING ON TESTNET !!!");
                console.log("THIS IS FOR TESTING PURPOSE ONLY !!!");
                console.log("==========================================================\n")
                setConfigByChainId(TESTNET_ID);
            }else{
                console.log("DEV MODE - switched to mainnet");
                setConfigByChainId(MAINNET_ID);
            }
            continue;
        }

        // Find the command object from Commander
        const matchedCommand = cli.commands.find(cmd => cmd.name() === command.split(' ')[0]);

        if (matchedCommand) {
            // Execute the command's action
            await matchedCommand.parseAsync(['node', 'sentry-node', ...command.split(' ')], { from: 'user' });
        } else {
            console.log('Unknown command. Please try again.');
        }
    }
});


console.log(`Starting Sentry CLI version ${version}`);
console.log(`Stake and redeem esXAI at https://app.xai.games`);
console.log("");

// Parse initial command-line arguments
cli.parse(process.argv);