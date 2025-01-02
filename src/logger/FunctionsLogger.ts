import * as logger from 'firebase-functions/logger';
import { BaseLogger, type LogLevel, type ILogger } from '@stevenkellner/typescript-common-functionality';

export class FunctionsLogger extends BaseLogger implements ILogger {

    public log(level: LogLevel, verbose: boolean, functionName: string, description: string | null, details: Record<string, unknown> | null): void {
        logger.write({
            severity: this.convertLogLevel(level),
            message: this.logMessage(level, verbose, functionName, description, details)
        });
    }

    private convertLogLevel(level: LogLevel): logger.LogSeverity {
        switch (level) {
            case 'debug':
                return 'DEBUG';
            case 'info':
                return 'INFO';
            case 'notice':
                return 'NOTICE';
            case 'warning':
                return 'WARNING';
            case 'error':
                return 'ERROR';
            case 'critical':
                return 'CRITICAL';
            case 'alert':
                return 'ALERT';
            case 'emergency':
                return 'EMERGENCY';
        }
    }
}
