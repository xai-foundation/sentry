import path from 'path';
import fs from 'fs';
import DailyRotateFile from 'winston-daily-rotate-file';
import winston from 'winston';

let logger: winston.Logger;
const getLogger = () => {
    if (!logger) {
        const transports = [];

        transports.push(
            new winston.transports.Console({
                format: winston.format.printf((log: { message: string }) => log.message),
            })
        )

        const LOG_PATH = getLogPath();
        mkdir(LOG_PATH);
        mkdir(path.join(LOG_PATH, 'errors'));

        transports.push(
            new DailyRotateFile({
                dirname: LOG_PATH,
                filename: 'combined',
                datePattern: 'yyyyMMDD',
                extension: '.log',
                maxFiles: '3d'
            }),
        )

        transports.push(
            new DailyRotateFile({
                dirname: path.join(LOG_PATH, 'errors'),
                filename: 'error',
                datePattern: 'yyyyMMDD',
                level: 'error',
                extension: '.log',
                maxFiles: '14d'
            })
        )

        logger = winston.createLogger({
            transports
        });
    }

    return logger;
};

// Return the os specific app data folder
// OS X - '/Users/user/Library/Preferences/sentry-cli/logs'
// Windows - 'C:\Users\user\AppData\Roaming\sentry-cli\logs'
// Linux - '/home/user/.local/share/sentry-cli/logs'
const getLogPath = (): string => {
    const root = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
    return path.join(root, 'sentry-cli', 'logs')
}

const mkdir = (_path: string): void => {
    if (!fs.existsSync(_path)) {
        fs.mkdirSync(_path, { recursive: true });
    }
}

const log = (...args: any): void => {
    getLogger().info({ timestamp: new Date().toLocaleString(), level: 'INFO', message: args, PID: process.pid });
};

const error = (...args: any): void => {
    getLogger().error({ timestamp: new Date().toLocaleString(), level: 'ERROR', message: args, PID: process.pid });
};

export default {
    log, error
}