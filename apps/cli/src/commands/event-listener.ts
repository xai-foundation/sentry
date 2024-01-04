import { resilientEventListener, config, RefereeAbi } from '@sentry/core';
import Vorpal from 'vorpal';

export function eventListener(cli: Vorpal) {
    cli
        .command('event-listener', 'Starts the event listener with provided arguments')
        .option('-r, --rpcUrl <rpcUrl>', 'RPC URL')
        .option('-c, --contractAddress <contractAddress>', 'Contract address')
        .option('-a, --abi <abi>', 'ABI of the contract')
        .option('-e, --eventName <eventName>', 'Event name to listen for')
        .action(async function (this: Vorpal.CommandInstance, args) {
            const { rpcUrl, contractAddress, abi, eventName } = args.options;

            const { stop } = resilientEventListener({
                rpcUrl: rpcUrl ? rpcUrl : config.arbitrumOneWebSocketUrl,
                contractAddress: contractAddress ? contractAddress : config.refereeAddress,
                abi: abi ? JSON.parse(abi) : RefereeAbi,
                eventName: eventName ? eventName : "RewardsClaimed",
                log: (value: string) => this.log(value),
            });

            return new Promise((resolve, reject) => { }); // Keep the command alive

        });
}
