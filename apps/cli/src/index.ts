import * as Vorpal from 'vorpal';
import { createBlsKeyPair } from './commands/create-bls-key-pair';
import { bootChallenger } from './commands/boot-challenger';
import { createMnemonic } from './commands/create-mnemonic';
import { getPrivateKeyFromMnemonic } from './commands/get-private-key-from-memonic';
import { getPublicKeyFromPrivateKey } from './commands/get-public-key-from-private-key';
import { manuallyChallengeAssertion } from './commands/manually-challenge-assertion';
import { addAdmin } from './commands/access-control/add-admin';
import { addChallenger } from './commands/access-control/add-challenger';
import { getListOfAdmins } from './commands/access-control/get-list-of-admins';
import { getListOfChallengers } from './commands/access-control/get-list-of-challengers';
import { getRefereeContractAddress } from './commands/get-referee-address';
import { setChallengerPublicKey } from './commands/set-challenger-public-key';
import { removeAdmin } from './commands/access-control/remove-admin';
import { removeChallenger } from './commands/access-control/remove-challenger';
import { getAssertionCheckingStatus } from './commands/get-assertion-checking-status';
import { toggleAssertionCheckingCommand } from './commands/toggle-assertion-checking';

const cli = new Vorpal();

// entrypoints to each of the commands
addAdmin(cli);
addChallenger(cli);
removeAdmin(cli);
removeChallenger(cli);
bootChallenger(cli);
createBlsKeyPair(cli);
createMnemonic(cli);
getListOfAdmins(cli);
getListOfChallengers(cli);
getPrivateKeyFromMnemonic(cli);
getPublicKeyFromPrivateKey(cli);
getRefereeContractAddress(cli);
manuallyChallengeAssertion(cli);
setChallengerPublicKey(cli);
getAssertionCheckingStatus(cli);
toggleAssertionCheckingCommand(cli);

cli
    .delimiter('vanguard-node$')
    .show()
    .log('\nType "help" to display a list of actions.');
