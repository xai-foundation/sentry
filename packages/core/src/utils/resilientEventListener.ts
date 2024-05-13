import WebSocket from 'isomorphic-ws';
import { Contract, InterfaceAbi, LogDescription } from "ethers";

interface ResilientEventListenerArgs {
    rpcUrl: string,
    contractAddress: string,
    abi: InterfaceAbi,
    eventName: string | string[],
    log?: (value: string, ...values: string[]) => void;
    callback?: (log: LogDescription | null, err?: EventListenerError) => void;
}

export interface EventListenerError {
    message: string;
    type: "onclose" | "onerror" | "onmessage";
}

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 60 * 1000; //7500;

/**
 * This function creates a resilient event listener for a given contract on an EVM-based network.
 * It uses a WebSocket connection to the EVM node specified by the rpcUrl.
 * The event listener is resilient in the sense that it will automatically reconnect in case of connection errors or closure.
 * It supports listening to multiple events if an array of event names is provided.
 * 
 * @param args - The arguments for the event listener.
 * @param args.rpcUrl - The URL of the EVM node to connect to.
 * @param args.contractAddress - The address of the contract to listen to.
 * @param args.abi - The ABI of the contract.
 * @param args.eventName - The name(s) of the event(s) to listen to. Can be a single event name or an array of event names.
 * @param args.log - An optional logging function. If provided, it will be called with log messages.
 * @param args.callback - An optional callback function. If provided, it will be called with the parsed log data whenever an event is received.
 */
export function resilientEventListener(args: ResilientEventListenerArgs) {
    let ws: WebSocket | null = null;

    let pingTimeout: NodeJS.Timeout;
    let keepAliveInterval: NodeJS.Timeout;
    let isStoppedManually = false;

    const logCb = args.log ? args.log : (value: string, ...values: string[]) => { };
    const callback = args.callback ? args.callback : (log: LogDescription | null, error: any | undefined) => { };

    const connect = () => {
        try {
            ws = new WebSocket(args.rpcUrl);

            const contract = new Contract(args.contractAddress, args.abi);
            // Handle eventName being an array or a single string
            const topicHashes = Array.isArray(args.eventName) ? args.eventName.map(name => contract.getEvent(name).getFragment().topicHash) : [contract.getEvent(args.eventName).getFragment().topicHash];
            let subscriptionIds: string[] = [];

            logCb(`[${new Date().toISOString()}] Subscribing to event listener with topic hash(es): ${topicHashes.join(', ')}`);

            const requests = topicHashes.map((topicHash, index) => ({
                id: index + 1,
                method: "eth_subscribe",
                params: [
                    "logs",
                    {
                        topics: [topicHash],
                        address: args.contractAddress,
                    }
                ]
            }));

            // sending this backs should return a result of true
            const ping = {
                id: requests.length + 1,
                method: "net_listening",
                params: [],
            };

            ws.onerror = function error(err: WebSocket.ErrorEvent) {
                logCb(`[${new Date().toISOString()}] WebSocket error: ${err.error}: ${err.message}`);
                callback(null, { type: "onerror", message: `WebSocket error: ${err.message}` });
            };

            ws.onclose = function close() {
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                if (pingTimeout) clearTimeout(pingTimeout);
                ws = null;
                
                if (!isStoppedManually) {
                    setTimeout(connect, 1000);
                    logCb(`[${new Date().toISOString()}] WebSocket closed, reconnecting automatically`);
                    callback(null, { type: "onclose", message: `WebSocket closed, reconnecting automatically` });
                } else {
                    logCb(`[${new Date().toISOString()}] WebSocket closed`);
                    callback(null, { type: "onclose", message: `WebSocket closed` });
                }
            };

            ws.onmessage = function message(event: any) {
                try {
                    let parsedData: any;
                    if (typeof event.data === 'string') {
                        parsedData = JSON.parse(event.data);
                    } else if (event.data instanceof ArrayBuffer) {
                        const dataString = new TextDecoder().decode(event.data);
                        parsedData = JSON.parse(dataString);
                    }

                    // Check if the message corresponds to one of our subscription requests
                    const requestIndex = requests.findIndex(req => parsedData?.id === req.id);
                    if (requestIndex !== -1) {
                        subscriptionIds.push(parsedData.result);
                        logCb(`[${new Date().toISOString()}] Subscription to event established with subscription ID '${parsedData.result}'.`);
                    } else if (parsedData?.id === ping.id && parsedData?.result === true) {
                        logCb(`[${new Date().toISOString()}] Health check complete, subscription is still active.`)
                        if (pingTimeout) clearTimeout(pingTimeout);
                    } else if (parsedData?.method === 'eth_subscription' && subscriptionIds.includes(parsedData.params.subscription)) {
                        const eventResult = parsedData.params.result;
                        const eventLog = contract.interface.parseLog(eventResult);
                        logCb(`[${new Date().toISOString()}] Received event ${eventLog?.name}: ${eventLog?.args}`);
                        callback(eventLog);
                    }

                } catch (error) {
                    logCb(`[${new Date().toISOString()}] Error in message handling: ${error}`);
                    callback(null, { type: "onmessage", message: `Error in message handling: ${error && (error as Error).message ? (error as Error).message : error as string}` });
                }
            };

            ws.onopen = function open() {
                logCb(`[${new Date().toISOString()}] Opened connection to WebSocket RPC`);
                requests.forEach(request => ws!.send(JSON.stringify(request)));

                keepAliveInterval = setInterval(() => {
                    if (!ws) {
                        logCb(`[${new Date().toISOString()}] No WebSocket, exiting keep alive interval`);
                        return;
                    }
                    logCb(`[${new Date().toISOString()}] Performing health check on the WebSocket RPC, to maintain subscription.`);

                    ws.send(JSON.stringify(ping));
                    pingTimeout = setTimeout(() => {
                        if (ws) ws.terminate();
                    }, EXPECTED_PONG_BACK);

                }, KEEP_ALIVE_CHECK_INTERVAL);

            };

        } catch (error) {
            logCb(`[${new Date().toISOString()}] Error in connect function: ${error}`);
            throw error;
        }
    }

    const stop = () => {
        isStoppedManually = true;
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (pingTimeout) clearTimeout(pingTimeout);
        if (ws) {
            ws.close();
            ws = null;
        }
    };

    connect();

    return { stop };
}

