import fs from 'fs';
import path from 'path';
import { config } from '@xai-vanguard-node/core';

/**
 * Updates the configuration file with the provided config object.
 * @param newConfig - The new configuration object to be merged with the existing one.
 */
export function writeToConfig(newConfig) {

    // Merge the existing and new config objects
    const updatedConfig = { ...config, ...newConfig };

    // Sort the keys of the updated config object in alphabetical order
    const sortedConfig = Object.keys(updatedConfig).sort().reduce((result, key) => {
        result[key] = updatedConfig[key];
        return result;
    }, {});

    // override the current config in memory
    config = sortedConfig;

    // Convert the sorted config object to a string
    const updatedConfigStr = `export const config = ${JSON.stringify(sortedConfig, null, 2)};`;
    console.log("New config written", updatedConfigStr);

    // Determine the path to the config file dynamically
    const configFilePath = path.resolve(process.cwd(), '../../packages/core/src/config.ts');

    // Write the updated config string to the config file
    fs.writeFileSync(configFilePath, updatedConfigStr, 'utf8');

}