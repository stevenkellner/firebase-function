import type { ILogger } from './ILogger';

export class VoidLogger implements ILogger {

    public readonly completeLog: string = '';

    public get nextIndent(): ILogger {
        return this;
    }

    public log(): void {}
}
