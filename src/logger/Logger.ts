import type { ILogger } from './ILogger';
import { LogLevel } from './LogLevel';
import { LoggingProperty } from './LoggingProperty';
import { StringBuilder } from '../types/StringBuilder';
import type { VerboseType } from './VerboseType';

export class Logger implements ILogger {
    private constructor(
        public verbose: VerboseType,
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

    public static start(
        verbose: VerboseType,
        functionName: string,
        details: Record<string, unknown> | null = null,
        logLevel: LogLevel.Value = 'debug'
    ): Logger {
        const property = new LoggingProperty(functionName, new LogLevel(logLevel), 0, details);
        return new Logger(verbose, [property]);
    }

    public log(
        functionName: string,
        details: Record<string, unknown> | null = null,
        logLevel: LogLevel.Value = 'debug'
    ): void {
        this.properties.push(new LoggingProperty(functionName, new LogLevel(logLevel), this.currentIndent, details));
    }
}
