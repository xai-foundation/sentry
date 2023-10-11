import * as Vorpal from 'vorpal';
import { addAdmin } from './commands/access-control/add-admin';
import { addChallenger } from './commands/access-control/add-challenger';
import { bootChallenger } from './commands/boot-challenger';
import { createBlsKeyPair } from './commands/create-bls-key-pair';
import { createMnemonic } from './commands/create-mnemonic';
import { getAssertionCheckingStatus } from './commands/get-assertion-checking-status';
import { getListOfAdmins } from './commands/access-control/get-list-of-admins';
import { getListOfChallengers } from './commands/access-control/get-list-of-challengers';
import { getPrivateKeyFromMnemonic } from './commands/get-private-key-from-memonic';
import { getPublicKeyFromPrivateKey } from './commands/get-public-key-from-private-key';
import { manuallyChallengeAssertion } from './commands/manually-challenge-assertion';
import { removeAdmin } from './commands/access-control/remove-admin';
import { removeChallenger } from './commands/access-control/remove-challenger';
import { setChallengerPublicKey } from './commands/set-challenger-public-key';
import { toggleAssertionChecking } from './commands/toggle-assertion-checking';
import { addOperator } from './commands/operator-control/add-operator';
import { removeOperator } from './commands/operator-control/remove-operator';
import { listOperators } from './commands/operator-control/list-operators';
import { mintNodeLicenses } from "./commands/mint-node-licenses";
import { listNodeLicenses } from './commands/list-node-licenses';
import { setRollupAddress } from './commands/set-rollup-address';
import { getListOfKycAdmins } from './commands/access-control/get-list-of-kyc-admins';
import { addKycAdmin } from './commands/access-control/add-kyc-admin';
import { removeKycAdmin } from './commands/access-control/remove-kyc-admin';
import { listKycStatuses } from './commands/kyc/list-kyc-status';
import { checkKycStatus } from './commands/kyc/check-kyc-status';
import { setKycStatus } from './commands/kyc/set-kyc-status';
import { totalSupply } from './commands/xai-token/total-supply';
import { getBalancesForAddresses } from './commands/xai-token/get-balances';
import { getAllContractAddresses } from './commands/get-contract-addresses';
import { checkWhitelist } from './commands/xai-token/check-whitelist';
import { changeWhitelistStatus } from './commands/xai-token/change-whitelist-status';

const cli = new Vorpal();

// entrypoints to each of the commands
addAdmin(cli);
addChallenger(cli);
addKycAdmin(cli);
addOperator(cli);
bootChallenger(cli);
checkKycStatus(cli);
createBlsKeyPair(cli);
createMnemonic(cli);
getAssertionCheckingStatus(cli);
getBalancesForAddresses(cli);
getListOfAdmins(cli);
getListOfChallengers(cli);
getListOfKycAdmins(cli);
getPrivateKeyFromMnemonic(cli);
getPublicKeyFromPrivateKey(cli);
listKycStatuses(cli);
listNodeLicenses(cli);
listOperators(cli);
manuallyChallengeAssertion(cli);
mintNodeLicenses(cli);
removeAdmin(cli);
removeChallenger(cli);
removeKycAdmin(cli);
removeOperator(cli);
setChallengerPublicKey(cli);
setKycStatus(cli);
setRollupAddress(cli);
toggleAssertionChecking(cli);
totalSupply(cli);
getAllContractAddresses(cli);
checkWhitelist(cli);
changeWhitelistStatus(cli);

cli
    .delimiter('vanguard-node$')
    .show()
    .log('\nType "help" to display a list of actions.');
