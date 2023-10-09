import type { LogLevel } from './LogLevel';
import { StringBuilder } from '../types/StringBuilder';
import type { VerboseType } from './VerboseType';
import { inspect } from 'util';

export class LoggingProperty {
    public constructor(
        private readonly functionName: string,
        private readonly logLevel: LogLevel,
        private readonly indent: number,
        private readonly details: Record<PropertyKey, unknown> | null
    ) {}

    public completeLog(verbose: VerboseType): string {
        const builder = new StringBuilder();
        builder.appendLine(this.prefix(true) + this.logLevel.coloredText(`[${this.functionName}]`, verbose.isColored) + (verbose.isVerbose ? ': {' : ''));
        if (this.details && verbose.isVerbose) {
            for (const entry of Object.entries(this.details))
                builder.append(this.detailString(entry[0], entry[1], verbose));
        }
        if (verbose.isVerbose)
            builder.appendLine(`${this.prefix(false)}}`);
        return builder.toString();
    }

    private prefix(start: boolean = false): string {
        return '|   '.repeat(this.indent) + (start ? '> ' : '| ');
    }

    private detailString(key: string, detail: unknown, verbose: VerboseType): string {
        const builder = new StringBuilder();
        const json = inspect(detail, { compact: true, depth: null, maxArrayLength: 25, maxStringLength: 250, breakLength: Number.POSITIVE_INFINITY });
        function coloredText(value: string): string {
            if (verbose.isColored)
                return `\x1b[2m${value}\x1b[0m`;
            return value;
        }
        builder.appendLine(`${this.prefix()}    ${key}: ${coloredText(json)}`);
        return builder.toString();
    }
}
