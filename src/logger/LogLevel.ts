export type LogLevel = 'debug' | 'info' | 'notice';

export namespace LogLevel {
    export function coloredText(logLevel: LogLevel, text: string, colored: boolean): string {
        if (!colored) return text;
        switch (logLevel) {
            case 'debug': return `\x1b[33m${text}\x1b[0m`;
            case 'info': return `\x1b[31m${text}\x1b[0m`;
            case 'notice': return `\x1b[34m${text}\x1b[0m`;
        }
    }
}
