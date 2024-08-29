import { ethers, LogDescription } from 'ethers';
import { EventListenerError, resilientEventListener } from "../utils/resilientEventListener.js";
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { config, getProvider, sendSlackNotification } from "../index.js";

//The number of restart attempts if the monitor errors
const NUM_EVENT_LISTENER_RETRIES = 10 as const;
//Number of consecutive websocket errors allowed before runtime restart
const NUM_CON_WS_ALLOWED_ERRORS = 10 as const;
//Delays for auto restart the monitor, on the first error it will wait 30 seconds, then 3 minutes then 10 minutes before trying to restart.
const ASSERTION_LISTENER_RETRY_DELAYS = [30_000, 60_000, 120_000, 180_000, 180_000, 180_000, 300_000, 300_000, 300_000, 300_000] as const;
// We expect the event to fire about every 60 minutes
const EXPECTED_TIME_BETWEEN_EVENTS = 60 * 60 * 1000;
// After 70 minutes between events we will notify
const MAX_TIME_OVER_EVENT_BEFORE_ALERT = 10 * 60 * 1000;

let cachedWebhookUrl: string;
let cachedLogger: (log: string) => void;
let currentNumberOfRetries = 0;

let lastEventTime: number;
let latestNodeCreated = 0;

const checkTimeSinceLastEvent = async () => {
    const currentTime = Date.now();
    cachedLogger(`The currentTime is ${new Date(currentTime).toLocaleDateString()} (${currentTime})`);

    const timePassedSinceLastEvent = currentTime - lastEventTime;

    if (timePassedSinceLastEvent > (EXPECTED_TIME_BETWEEN_EVENTS + MAX_TIME_OVER_EVENT_BEFORE_ALERT)) {
        cachedLogger(`No event detected for more than EXPECTED_TIME_BETWEEN_EVENTS: ${EXPECTED_TIME_BETWEEN_EVENTS / 1000}s`);

        const currentNodeNum = await getLatestNodeNum();
        if (currentNodeNum > latestNodeCreated) {
            createLog(`Missed NodeCreated event during runtime, latest nodeNum in memory: ${latestNodeCreated}, latest nodeNum onchain: ${currentNodeNum}. Resetting timer and starting event listener`, true, false);
            latestNodeCreated = currentNodeNum;
            lastEventTime = Date.now();
            return;
        }

        const timeSinceLastAssertion = Math.round((timePassedSinceLastEvent) / 60000);
        createLog(`It has been ${timeSinceLastAssertion} minutes since the last NodeCreated event, latest nodeNum detected was ${latestNodeCreated}. Please check the Rollup Protocol (https://arbiscan.io/address/${config.rollupAddress}#readProxyContract - 22. latestNodeCreated).`, true, true);
    }
};

const createLog = async (message: string, sendNotification: boolean, alertChannel: boolean) => {
    cachedLogger(message);
    if (sendNotification) {
        await sendSlackNotification(cachedWebhookUrl, `${alertChannel ? "<!channel>" : ""} ${message}`, cachedLogger);
    }
}

const getLatestNodeNum = async (): Promise<number> => {

    const provider = getProvider();

    const rollupContract = new ethers.Contract(
        config.rollupAddress,
        RollupAdminLogicAbi,
        provider
    );

    const nodeNum = await rollupContract.latestNodeCreated();
    return Number(nodeNum);
}

const startListener = async () => {

    let errorCount = 0;
    let isStopping = false;

    const stopListener = (listener: any) => {
        if (!isStopping) {
            isStopping = true;
            listener.stop();
        }
    }

    return new Promise((resolve) => {

        const listener = resilientEventListener({
            rpcUrl: config.arbitrumOneWebSocketUrl,
            contractAddress: config.rollupAddress,
            abi: RollupAdminLogicAbi,
            eventName: "NodeCreated",
            log: cachedLogger,
            callback: async (log: LogDescription | null, err?: EventListenerError) => {
                if (err) {

                    if (isStopping) {
                        // If we stopped manually we don't want to process the error from the closing event.
                        return;
                    }
                    errorCount++;

                    // We should allow a defined number of consecutive WS errors before restarting the websocket at all
                    if (errorCount > NUM_CON_WS_ALLOWED_ERRORS) {
                        stopListener(listener);
                        resolve(err);
                        return;
                    }

                } else if (log) {
                    lastEventTime = Date.now();
                    currentNumberOfRetries = 0;
                    const nodeNum = Number(BigInt(log.args[0]))
                    latestNodeCreated = nodeNum;
                    createLog(`NodeCreated event detected, assertion id: ${nodeNum}`, true, false);

                } else {
                    createLog(`Empty event emitted, if this keeps happening check the RPC provider for ${config.arbitrumOneWebSocketUrl}, contract: ${config.rollupAddress}, event: "NodeCreated"`, true, false);
                }
            }
        })
    })
}

/**
 * Start a runtime to monitor NodeCreated events on the Rollup contract
 * This will send notifications to the webhook if there is more than ~70 minutes between two NodeCreated events.
 */
export async function nodeCreatedMonitor(webhookUrl: string, loggerFunction: (log: string) => void) {

    cachedWebhookUrl = webhookUrl;
    cachedLogger = loggerFunction;

    // Check if submit assertion has not been run for over 1 hour and 10 minutes
    const eventMonitorCheckInterval = setInterval(() => {
        checkTimeSinceLastEvent();
    }, 5 * 60 * 1000);

    for (; currentNumberOfRetries <= NUM_EVENT_LISTENER_RETRIES; currentNumberOfRetries++) {

        const latestNodeNum = await getLatestNodeNum();
        if (latestNodeCreated === 0) {
            latestNodeCreated = latestNodeNum;
            createLog(`Starting up listener, latest NodeCreated: ${latestNodeCreated}`, true, true);
        } else {
            if (latestNodeNum != latestNodeCreated) {
                createLog(`Missed NodeCreated event upon restart, latest nodeNum in memory: ${latestNodeCreated}, latest nodeNum onchain: ${latestNodeNum}. Resetting timer and starting event listener`, true, true);
                latestNodeCreated = latestNodeNum;
                lastEventTime = Date.now();
            }
        }

        const listenerError = await startListener();
        createLog(`Event listener stopped with error: ${listenerError}`, true, true);

        if (currentNumberOfRetries + 1 <= NUM_EVENT_LISTENER_RETRIES) {
            const delayPerRetry = ASSERTION_LISTENER_RETRY_DELAYS[currentNumberOfRetries];
            createLog(`Event monitor restarting after ${delayPerRetry / 1000} seconds`, true, true);

            //Wait for delay per retry
            await (new Promise((resolve) => {
                setTimeout(resolve, delayPerRetry);
            }))

            createLog(`Event monitor restarting with ${NUM_EVENT_LISTENER_RETRIES - (currentNumberOfRetries + 1)} attempts left.`, true, true);
        }

    }

    clearInterval(eventMonitorCheckInterval);
    createLog(`Event monitor has stopped after ${NUM_EVENT_LISTENER_RETRIES} attempts.`, true, true);
}