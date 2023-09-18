import * as Vorpal from 'vorpal';
import { createBlsKeyPair } from './commands/create-bls-key-pair';
import { bootChallenger } from './commands/boot-challenger';
import { createMnemonic } from './commands/create-mnemonic';
import { getPrivateKeyFromMnemonic } from './commands/get-private-key-from-memonic';
import { getPublicKeyFromPrivateKey } from './commands/get-public-key-from-private-key';
import { mockChallengeAssertion } from './commands/mock-challenge-assertion';
import { addAdmin } from './commands/access-control/add-admin';
import { addChallenger } from './commands/access-control/add-challenger';
import { getListOfAdmins } from './commands/access-control/get-list-of-admins';
import { getListOfChallengers } from './commands/access-control/get-list-of-challengers';
import { getRefereeContractAddress } from './commands/get-referee-address';

const cli = new Vorpal();

// entrypoints to each of the commands
createBlsKeyPair(cli);
bootChallenger(cli);
createMnemonic(cli);
getPrivateKeyFromMnemonic(cli);
getPublicKeyFromPrivateKey(cli);
mockChallengeAssertion(cli);
addAdmin(cli);
addChallenger(cli);
getListOfAdmins(cli);
getListOfChallengers(cli);
getRefereeContractAddress(cli);

cli
    .delimiter('vanguard-node$')
    .show()
    .log('\nType "help" to display a list of actions.');
