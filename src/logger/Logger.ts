import { StringBuilder } from '../StringBuilder';
import { type ILogger } from './ILogger';
import { type LoggingProperty } from './LoggingProperty';
import { LogLevel } from './LogLevel';
import { type VerboseType } from './VerboseType';

export class Logger implements ILogger {
    private constructor(
        private readonly verbose: VerboseType,
        private readonly properties: LoggingProperty[],
        private readonly currentIndent: number = 0
    ) {}

    public static start(
        verbose: VerboseType,
        functionName: string,
        details?: Record<string, unknown>,
        logLevel: LogLevel = 'debug'
    ): ILogger {
        const property: LoggingProperty = {
            functionName: functionName,
            logLevel: logLevel,
            indent: 0,
            details: details
        };
        return new Logger(verbose, [property]);
    }

    public get nextIndent(): ILogger {
        return new Logger(this.verbose, this.properties, this.currentIndent + 1);
    }

    public log(
        functionName: string,
        details?: Record<string, unknown>,
        logLevel: LogLevel = 'debug'
    ) {
        this.properties.push({
            functionName: functionName,
            logLevel: logLevel,
            indent: this.currentIndent,
            details: details
        });
    }

    private propertyString(property: LoggingProperty): string {
        const builder = new StringBuilder();
        builder.appendLine(
            `${' '.repeat(2 * property.indent)}| ${LogLevel.coloredText(property.logLevel, `[${property.functionName}]`, this.verbose === 'colored' || this.verbose === 'coloredVerbose')}`
        );
        if (property.details !== undefined && (this.verbose === 'verbose' || this.verbose === 'coloredVerbose')) {
            for (const entry of Object.entries(property.details))
                builder.append(this.detailString(property.indent, entry[0], entry[1]));
        }
        return builder.toString();
    }

    private detailString(indent: number, key: string, detail: unknown): string {
        const builder = new StringBuilder();
        const jsonLines = JSON.stringify(detail, undefined, '  ')?.split('\n') ?? [''];
        builder.appendLine(`${' '.repeat(2 * indent)}| ${`${key}: \x1b[40m\x1b[2m${jsonLines.shift() ?? ''}\x1b[0m`}`);
        for (const line of jsonLines)
            builder.appendLine(`${' '.repeat(2 * indent)}| ${' '.repeat(key.length + 2)}\x1b[40m\x1b[2m${line}\x1b[0m`);
        return builder.toString();
    }

    public get completeLog(): string {
        const builder = new StringBuilder();
        for (const property of this.properties)
            builder.append(this.propertyString(property));
        return builder.toString();
    }
}
