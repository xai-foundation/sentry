import WebSocket from 'isomorphic-ws';
import {Contract, InterfaceAbi, LogDescription} from "ethers";

interface ResilientEventListenerArgs {
    rpcUrl: string,
    contractAddress: string,
    abi: InterfaceAbi,
    eventName: string,
    log?: (value: string, ...values: string[]) => void;
    callback?: (log: LogDescription | null) => void;
}

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 60 * 1000; //7500;

/**
 * This function creates a resilient event listener for a given contract on an EVM-based network.
 * It uses a WebSocket connection to the EVM node specified by the rpcUrl.
 * The event listener is resilient in the sense that it will automatically reconnect in case of connection errors or closure.
 * 
 * @param args - The arguments for the event listener.
 * @param args.rpcUrl - The URL of the EVM node to connect to.
 * @param args.contractAddress - The address of the contract to listen to.
 * @param args.abi - The ABI of the contract.
 * @param args.eventName - The name of the event to listen to.
 * @param args.log - An optional logging function. If provided, it will be called with log messages.
 * @param args.callback - An optional callback function. If provided, it will be called with the parsed log data whenever an event is received.
 */
export function resilientEventListener(args: ResilientEventListenerArgs) {
    let ws: WebSocket | null = null;

    let pingTimeout: NodeJS.Timeout;
    let keepAliveInterval: NodeJS.Timeout;

    const connect = () => {
        ws = new WebSocket(args.rpcUrl);

        const contract = new Contract(args.contractAddress, args.abi);
        const topicHash = contract.getEvent(args.eventName).getFragment().topicHash;
        let subscriptionId: string;

        args.log && args.log(`[${new Date().toISOString()}] subscribing to event listener with topic hash: ${topicHash}`);

        const request = {
            id: 1,
            method: "eth_subscribe",
            params: [
                "logs",
                {
                    topics: [topicHash],
                    address: args.contractAddress,
                }
            ]
        };

        // sending this backs should return a result of true
        const ping = {
            id: 2,
            method: "net_listening",
            params:[],
        };

        ws.onerror = function error(err: any) {
            args.log && args.log(`[${new Date().toISOString()}] WebSocket error: ${err}`);
        };

        ws.onclose = function close() {
            args.log && args.log(`[${new Date().toISOString()}] WebSocket closed`);
            if (keepAliveInterval) clearInterval(keepAliveInterval);
            if (pingTimeout) clearTimeout(pingTimeout);
            ws = null;
            // Reconnect when the connection is closed
            setTimeout(connect, 1000);
        };

        ws.onmessage = function message(event: any) {
            let parsedData;
            if (typeof event.data === 'string') {
                parsedData = JSON.parse(event.data);
            } else if (event.data instanceof ArrayBuffer) {
                const dataString = new TextDecoder().decode(event.data);
                parsedData = JSON.parse(dataString);
            }

            if (parsedData?.id === request.id) {
                subscriptionId = parsedData.result;
                args.log && args.log(`[${new Date().toISOString()}] Subscription to event '${args.eventName}' established with subscription ID '${parsedData.result}'.`);
            } else if(parsedData?.id === ping.id && parsedData?.result === true) { 
                args.log && args.log(`[${new Date().toISOString()}] Health check complete, subscription to '${args.eventName}' is still active.`)
                if (pingTimeout) clearInterval(pingTimeout);
            } else if (parsedData?.method === 'eth_subscription' && parsedData.params.subscription === subscriptionId) {
                const log = parsedData.params.result;
                const event = contract.interface.parseLog(log);
                args.log && args.log(`[${new Date().toISOString()}] Received event ${event?.name}: ${event?.args}`);
                args.callback && args.callback(event);
            }
        };

        ws.onopen = function open() {
            args.log && args.log(`[${new Date().toISOString()}] Opened connection to Web Socket RPC`)
            ws!.send(JSON.stringify(request));

            keepAliveInterval = setInterval(() => {
                if (!ws) {
                  args.log && args.log(`[${new Date().toISOString()}] No websocket, exiting keep alive interval`);
                  return;
                }
                args.log && args.log(`[${new Date().toISOString()}] Performing health check on the Web Socket RPC, to maintain subscription to '${args.eventName}'.`);
        
                ws.send(JSON.stringify(ping));
                pingTimeout = setTimeout(() => {
                  if (ws) ws.terminate();
                }, EXPECTED_PONG_BACK);
                
            }, KEEP_ALIVE_CHECK_INTERVAL);

        };
    }

    const stop = () => {
        if (ws) {
            ws.close();
            ws = null;
        }
        if (keepAliveInterval) clearInterval(keepAliveInterval);
        if (pingTimeout) clearTimeout(pingTimeout);
    };

    connect();

    return { stop };
}
