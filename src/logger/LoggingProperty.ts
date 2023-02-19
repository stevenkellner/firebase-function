import { type LogLevel } from './LogLevel';

export interface LoggingProperty {
    functionName: string;
    readonly logLevel: LogLevel;
    readonly indent: number;
    readonly details?: Record<PropertyKey, unknown>;
}
