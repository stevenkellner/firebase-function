import { StringBuilder } from '../StringBuilder';
import { type LogLevel } from './LogLevel';
import { type VerboseType } from './VerboseType';

export class LoggingProperty {
    public constructor(
        private readonly functionName: string,
        private readonly logLevel: LogLevel,
        private readonly indent: number,
        private readonly details?: Record<PropertyKey, unknown>
    ) {}

    private prefix(start: boolean = false): string {
        return '|   '.repeat(this.indent) + (start ? '⎧ ' : '| ');
    }

    public completeLog(verbose: VerboseType): string {
        const builder = new StringBuilder();
        builder.appendLine(this.prefix(true) + this.logLevel.coloredText(`[${this.functionName}]`, verbose.isColored) + (verbose.isVerbose ? ': {' : ''));
        if (this.details !== undefined && verbose.isVerbose) {
            for (const entry of Object.entries(this.details))
                builder.append(this.detailString(entry[0], entry[1], verbose));
        }
        if (verbose.isVerbose)
            builder.appendLine(this.prefix(false) + '}');
        return builder.toString();
    }

    private detailString(key: string, detail: unknown, verbose: VerboseType): string {
        const builder = new StringBuilder();
        const jsonLines = JSON.stringify(detail, undefined, 4).split('\n');
        const coloredText = (value: string): string => {
            if (verbose.isColored)
                return `\x1b[2m${value}\x1b[0m`;
            return value;
        };
        builder.appendLine(this.prefix() + '    ' + `${key}: ${coloredText(jsonLines.shift() ?? '')}`);
        for (const line of jsonLines)
            builder.appendLine(this.prefix() + '        ' + coloredText(line));
        return builder.toString();
    }
}
