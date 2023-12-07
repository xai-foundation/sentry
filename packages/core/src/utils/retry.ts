/**
 * Retry a process a specified number of times.
 * @param {() => Promise<T>} process - The process to retry.
 * @param {number} [retries=5] - The number of times to retry the process.
 * @returns {Promise<T>} The result of the process.
 * @throws Will throw an error if the process fails after the specified number of retries.
 */
export async function retry<T>(process: () => Promise<T>, retries: number = 5): Promise<T> {
    try {
        return await process();
    } catch (error) {
        if (retries === 0) {
            throw error;
        }
        await new Promise(resolve => setTimeout(resolve, Math.random() * (5000 - 1000) + 1000));
        return retry(process, retries - 1);
    }
}