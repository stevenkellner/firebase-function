import type { ILogger, LogLevel } from './ILogger';
import { LoggingProperty } from './LoggingProperty';
import { StringBuilder } from '../utils/StringBuilder';

export class Logger implements ILogger {

    private constructor(
        public verbose: boolean,
        private readonly properties: LoggingProperty[],
        private readonly currentIndent: number = 0
    ) {}

    public get nextIndent(): Logger {
        return new Logger(this.verbose, this.properties, this.currentIndent + 1);
    }

    public get completeLog(): string {
        const builder = new StringBuilder();
        for (const property of this.properties)
            builder.append(property.completeLog(this.verbose));
        return builder.toString();
    }

    public static start(functionName: string, details: Record<string, unknown> | null = null, logLevel: LogLevel = 'debug', verbose: boolean = false): Logger {
        const property = new LoggingProperty(functionName, logLevel, 0, details);
        return new Logger(verbose, [property]);
    }

    public log(functionName: string, details: Record<string, unknown> | null = null, logLevel: LogLevel = 'debug'): void {
        this.properties.push(new LoggingProperty(functionName, logLevel, this.currentIndent, details));
    }
}
