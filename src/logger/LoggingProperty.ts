import type { LogLevel } from './ILogger';
import { StringBuilder } from '../utils/StringBuilder';
import { inspect } from 'util';

export class LoggingProperty {
    public constructor(
        private readonly functionName: string,
        private readonly logLevel: LogLevel,
        private readonly indent: number,
        private readonly details: Record<PropertyKey, unknown> | null
    ) {}

    public completeLog(verbose: boolean): string {
        const builder = new StringBuilder();
        builder.appendLine(`${this.prefix(true)}[${this.logLevel}: ${this.functionName}]${verbose ? ': {' : ''}${!verbose || this.details ? '' : '}'}`);
        if (this.details && verbose) {
            for (const entry of Object.entries(this.details))
                builder.append(this.detailString(entry[0], entry[1]));
            builder.appendLine(`${this.prefix()}}`);
        }
        return builder.toString();
    }

    private detailString(key: string, detail: unknown): string {
        const builder = new StringBuilder();
        const jsonString = inspect(detail, { compact: true, depth: null, maxArrayLength: 25, maxStringLength: 250, breakLength: Number.POSITIVE_INFINITY });
        builder.appendLine(`${this.prefix()}    ${key}: ${jsonString}`);
        return builder.toString();
    }

    private prefix(start: boolean = false): string {
        return '|   '.repeat(this.indent) + (start ? '> ' : '| ');
    }
}
