// @ts-nocheck
import { Logger, TLogLevelColor, TLogLevelName, ISettingsParam } from 'tslog';

const logLevelsColors: TLogLevelColor = {
    0: 'cyan', // Silly
    1: 'white', // Trace
    2: 'green', // Debug
    3: 'blue', // Info
    4: 'yellow', // Warn
    5: 'red', // Error
    6: 'magenta', // Fatal
};

const settings: ISettingsParam = {
    displayFunctionName: false,
    exposeErrorCodeFrame: false,
    delimiter: '\t',
    dateTimeTimezone: 'Asia/Kuala_Lumpur',
    prettyInspectOptions: {
        colors: true,
        compact: false,
        depth: null,
    },
    jsonInspectOptions: {
        colors: true,
        compact: false,
        depth: null,
    },
    logLevelsColors,
};

export default function logger(name: string, ...args: string[]): Logger {
    const logLevel = process.env.LOG_LEVEL?.toLowerCase();
    const minLevel: TLogLevelName = ['silly', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(logLevel)
        ? logLevel
        : process.env.TEST_ENV?.toLowerCase() === 'true'
        ? 'info'
        : 'trace';

    return new Logger({
        // prefix: args ? args.map((s) => `\x1b[1m${s}\x1b[0m`) : undefined,
        minLevel,
        ...settings,
        name: `\x1b[0m\x1b[1m${name}\x1b[0m${args.reduce((n, s) => n + '\t' + s.padStart(8, ' '), '')}\x1b[90m`,
        displayFilePath: process.env.DISPLAY_FILE_PATH?.toLowerCase() === 'true' ? 'hideNodeModulesOnly' : 'hidden',
        stdErr: process.env.SPLIT_ERR?.toLowerCase() === 'true' ? process.stderr : process.stdout,
    });
}

export type { Logger, TLogLevelName as LogLevel };
