import { expect } from '@assertive-ts/core';
import { FunctionsLogger } from '../../src/logger/FunctionsLogger';
import * as logger from 'firebase-functions/logger';
import { capture, spy } from 'ts-mockito';

describe('FunctionsLogger', () => {
    let functionsLogger: FunctionsLogger;
    let spiedLoggger: typeof logger;

    beforeEach(() => {
        functionsLogger = new FunctionsLogger();
        spiedLoggger = spy(logger);
    });

    it('should log a debug message', () => {
        functionsLogger.log('debug', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'DEBUG',
            message: '[DEBUG: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log an info message', () => {
        functionsLogger.log('info', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'INFO',
            message: '[INFO: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log a warnin message', () => {
        functionsLogger.log('notice', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'NOTICE',
            message: '[NOTICE: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log a warning message', () => {
        functionsLogger.log('warning', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'WARNING',
            message: '[WARNING: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log an error message', () => {
        functionsLogger.log('error', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'ERROR',
            message: '[ERROR: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log a critical message', () => {
        functionsLogger.log('critical', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'CRITICAL',
            message: '[CRITICAL: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log an alert message', () => {
        functionsLogger.log('alert', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'ALERT',
            message: '[ALERT: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log an emergency message', () => {
        functionsLogger.log('emergency', true, 'testFunction', 'test description', { key: 'value' });
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'EMERGENCY',
            message: '[EMERGENCY: testFunction] test description | {\n\tkey: \'value\'\n}'
        });
    });

    it('should log a message with null description and details', () => {
        functionsLogger.log('info', true, 'testFunction', null, null);
        expect(capture(spiedLoggger.write).first()[0]).toBeEqual({
            severity: 'INFO',
            message: '[INFO: testFunction]'
        });
    });
});
