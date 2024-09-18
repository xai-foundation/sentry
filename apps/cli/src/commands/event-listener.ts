import { Command } from 'commander';
import { resilientEventListener, config, RefereeAbi } from '@sentry/core';

/**
 * Function to start the event listener with provided arguments.
 * @param cli - Commander instance
 */
export function eventListener(cli: Command): void {
    cli
        .command('event-listener')
        .description('Starts the event listener with provided arguments')
        .option('-r, --rpcUrl <rpcUrl>', 'RPC URL')
        .option('-c, --contractAddress <contractAddress>', 'Contract address')
        .option('-a, --abi <abi>', 'ABI of the contract')
        .option('-e, --eventName <eventName>', 'Event name to listen for')
        .action((args) => {
            const { rpcUrl, contractAddress, abi, eventName } = args;

            // Set default values if options are not provided
            const resolvedRpcUrl = rpcUrl || config.arbitrumOneWebSocketUrl;
            const resolvedContractAddress = contractAddress || config.refereeAddress;
            const resolvedAbi = abi ? JSON.parse(abi) : RefereeAbi;
            const resolvedEventName = eventName || "RewardsClaimed";

            // Start the resilient event listener
            const { stop } = resilientEventListener({
                rpcUrl: resolvedRpcUrl,
                contractAddress: resolvedContractAddress,
                abi: resolvedAbi,
                eventName: resolvedEventName,
                log: (value: string) => console.log(value),
            });

            console.log('Event listener started. Listening for events...');

            // Keep the process alive to continue listening
            process.stdin.resume();

            // Optional: Handle graceful shutdown on process exit
            process.on('SIGINT', async () => {
                console.log('Stopping event listener...');
                await stop();
                console.log('Event listener stopped.');
                process.exit(0);
            });
        });
}
