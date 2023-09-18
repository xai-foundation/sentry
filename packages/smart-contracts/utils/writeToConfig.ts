import fs from 'fs';
import path from 'path';
import { config } from '@xai-vanguard-node/core';

/**
 * Updates the configuration file with the provided config object.
 * @param newConfig - The new configuration object to be merged with the existing one.
 */
function updateConfig(newConfig: object): void {
    // Merge the existing and new config objects
    const updatedConfig = { ...config, ...newConfig };

    // Convert the updated config object to a string
    const updatedConfigStr = `export const config = ${JSON.stringify(updatedConfig, null, 2)};`;

    // Determine the path to the config file dynamically
    const configFilePath = path.resolve(__dirname, '../core/src/config.ts');

    // Write the updated config string to the config file
    fs.writeFileSync(configFilePath, updatedConfigStr, 'utf8');
}