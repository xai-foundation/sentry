import axios from "axios";

export const sendSlackNotification = async (webhookUrl: string, message: string, logCallback: (logMessage: string) => void): Promise<void> => {
    if (!webhookUrl || webhookUrl.length === 0) {
        logCallback(`Failed to send slack notification, missing webhook url.`);
        logCallback(`Failed message: ${message}`);   
    }

    let stringifiedMessage = typeof message !== 'string' ? JSON.stringify(message) : message;

    const headers = {
        'Content-Type': 'application/json'
    };

    try {

    const response = await axios.post(webhookUrl, {
        text: stringifiedMessage
    }, { headers });

    if (response.status !== 200) {
        logCallback(`Failed to send slack notification webhook: ${webhookUrl}`);
        logCallback(`Failed to send slack notification message: ${message}`);   
    }
        
    } catch (error) {
        logCallback(`Failed to send slack notification webhook: ${webhookUrl}`);
        logCallback(`Failed to send slack notification message: ${message}`);        
    }
}