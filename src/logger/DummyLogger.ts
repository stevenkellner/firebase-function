import { type ILogger } from './ILogger';
import { type LogLevel } from './LogLevel';

export class DummyLogger implements ILogger {
    public readonly nextIndent: ILogger = new DummyLogger();

    public log(
        functionName: string,
        details?: Record<string, unknown>,
        logLevel: LogLevel = 'debug'
    ) {}

    public readonly completeLog: string = '';
}
