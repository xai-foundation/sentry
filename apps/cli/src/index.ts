import { Command } from 'commander';
import inquirer from 'inquirer';
import { addAdmin } from './commands/access-control/add-admin.js';
import { syncStakingPools } from './commands/sync-staking-pools.js';
import { bootChallenger } from './commands/boot-challenger.js';
import { version } from "@sentry/core";

const program = new Command();

program
    .name('sentry-node')
    .description('CLI for managing the Sentry Node ecosystem')
    .version(version);

// Register commands
addAdmin(program);
bootChallenger(program);
syncStakingPools(program);

// Default action if no command is specified
program.action(async () => {
    console.log("No command specified. Use --help to see available commands.");
    program.outputHelp(); // Display help

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

        // Find the command object from Commander
        const matchedCommand = program.commands.find(cmd => cmd.name() === command.split(' ')[0]);

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
program.parse(process.argv);
