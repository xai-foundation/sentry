import * as Vorpal from 'vorpal';
import { createBlsKeyPair } from './commands/create-bls-key-pair';
import { bootChallenger } from './commands/boot-challenger';

const cli = new Vorpal();

// entrypoints to each of the commands
createBlsKeyPair(cli);
bootChallenger(cli);

cli
    .delimiter('vanguard-node$')
    .show()
    .log('\nType "help" to display a list of actions.');
