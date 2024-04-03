import { getNetwork } from "./web3.service";

export const post = async ({ body, headers = { 'Content-type': 'application/json' }, url }: { body?: any, headers?: any, url: string }) => {

    const options: RequestInit = {
        method: 'POST',
        headers: {
            ...headers,
        }
    }
    if (body) {
        options.body = JSON.stringify(body)
    }
    return sendRequest(url, options);
};

export const get = async ({ headers = { 'Content-type': 'application/json' }, url }: { headers?: any, url: string }) => {
    const options: RequestInit = {
        method: 'GET',
        headers: {
            ...headers
        }
    }
    return sendRequest(url, options);
};

const sendRequest = async (url: string, options: RequestInit): Promise<any> => {
    let response;
    try {
        response = await fetch(url, options);
    } catch (ex) {
        console.error("Request-Error", ex);
        throw "Failed to send request";
    }
    if (!response.ok) {
        throw await response.json();
    } else {
        return await response.json();
    }
};
