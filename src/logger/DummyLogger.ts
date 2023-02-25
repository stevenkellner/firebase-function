import { type ILogger } from './ILogger';
import { type LogLevel } from './LogLevel';

export class DummyLogger implements ILogger {
    public get nextIndent(): ILogger {
        return this;
    }

    public log(
        functionName: string,
        details?: Record<string, unknown>,
        logLevel: LogLevel = 'debug'
    ) {}

    public readonly completeLog: string = '';
}
