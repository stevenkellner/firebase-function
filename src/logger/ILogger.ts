export type LogLevel = 'debug' | 'info' | 'notice';

export interface ILogger {

    readonly nextIndent: ILogger;

    readonly completeLog: string;

    log(functionName: string, details?: Record<string, unknown> | null, logLevel?: LogLevel): void;
}
