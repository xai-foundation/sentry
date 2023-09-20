import fs from 'fs';
import path from 'path';
import { config } from '@xai-vanguard-node/core';

/**
 * Updates the configuration file with the provided config object.
 * @param newConfig - The new configuration object to be merged with the existing one.
 */
export function writeToConfig(newConfig: object): void {
    
    // Merge the existing and new config objects
    const updatedConfig = { ...config, ...newConfig } as Record<string, any>;

    // Sort the keys of the updated config object in alphabetical order
    const sortedConfig = Object.keys(updatedConfig).sort().reduce((result: Record<string, any>, key) => {
        result[key] = updatedConfig[key];
        return result;
    }, {});

    // Convert the sorted config object to a string
    const updatedConfigStr = `export const config = ${JSON.stringify(sortedConfig, null, 2)};`;

    // Determine the path to the config file dynamically
    const configFilePath = path.resolve(__dirname, '../../core/src/config.ts');

    // Write the updated config string to the config file
    fs.writeFileSync(configFilePath, updatedConfigStr, 'utf8');
}