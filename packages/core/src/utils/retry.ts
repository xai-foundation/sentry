/**
 * Retry a process a specified number of times.
 * @param {() => Promise<T>} process - The process to retry.
 * @param {number} [retries=5] - The number of times to retry the process.
 * @returns {Promise<T>} The result of the process.
 * @throws Will throw an error if the process fails after the specified number of retries.
 */
export async function retry<T>(process: () => Promise<T>, retries: number = 10): Promise<T> {
    try {
        return await process();
    } catch (error) {
        if (retries === 0) {
            console.error(`There was an error retrying a mechanism ${retries} times. Please save this error for troubleshooting.`);
            throw error;
        }
        const delay = retries === 1 ? 300000 : Math.random() * (30000 - 5000) + 5000; // Delay for 5 to 30 seconds, but 5 minutes for the last retry
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(process, retries - 1);
    }
}