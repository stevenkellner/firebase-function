import { type LogLevel } from './LogLevel';

export interface ILogger {
    readonly nextIndent: ILogger;
    log(functionName: string, details?: Record<string, unknown>, logLevel?: LogLevel.Value): void;
    readonly completeLog: string;
}
