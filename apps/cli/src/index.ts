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
import { getRefereeContractAddress } from './commands/get-referee-address';
import { manuallyChallengeAssertion } from './commands/manually-challenge-assertion';
import { removeAdmin } from './commands/access-control/remove-admin';
import { removeChallenger } from './commands/access-control/remove-challenger';
import { setChallengerPublicKey } from './commands/set-challenger-public-key';
import { toggleAssertionCheckingCommand } from './commands/toggle-assertion-checking';

const cli = new Vorpal();

// entrypoints to each of the commands
addAdmin(cli);
addChallenger(cli);
bootChallenger(cli);
createBlsKeyPair(cli);
createMnemonic(cli);
getAssertionCheckingStatus(cli);
getListOfAdmins(cli);
getListOfChallengers(cli);
getPrivateKeyFromMnemonic(cli);
getPublicKeyFromPrivateKey(cli);
getRefereeContractAddress(cli);
manuallyChallengeAssertion(cli);
removeAdmin(cli);
removeChallenger(cli);
setChallengerPublicKey(cli);
toggleAssertionCheckingCommand(cli);

cli
    .delimiter('vanguard-node$')
    .show()
    .log('\nType "help" to display a list of actions.');
