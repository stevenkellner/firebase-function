import type { ILogger } from './ILogger';

export class DummyLogger implements ILogger {
    public readonly completeLog: string = '';

    public get nextIndent(): ILogger {
        return this;
    }

    public log(): void {}
}
