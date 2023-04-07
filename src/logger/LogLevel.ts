export class LogLevel {
    public constructor(
        private readonly value: LogLevel.Value
    ) {}

    public coloredText(text: string, isColored: boolean): string {
        if (!isColored)
            return text;
        switch (this.value) {
            case 'debug':
                return `\x1b[33m${text}\x1b[0m`;
            case 'info':
                return `\x1b[31m${text}\x1b[0m`;
            case 'notice':
                return `\x1b[34m${text}\x1b[0m`;
        }
    }
}

export namespace LogLevel {
    export type Value = 'debug' | 'info' | 'notice';
}
