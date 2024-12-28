import { waitUntilUsed } from 'tcp-port-used';

async function waitForEmulators(): Promise<void> {
    await waitUntilUsed(5001, 500, 60000);
    await waitUntilUsed(8080, 500, 60000);
    // eslint-disable-next-line @stylistic/arrow-parens
    await new Promise(resolve => {
        setTimeout(resolve, 5000);
    });
}

async function waitForEmulatorsMaxTimeout(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
        waitForEmulators()
            .then(resolve)
            .catch(reject);
        setTimeout(reject, timeout);
    });
}

void waitForEmulatorsMaxTimeout(30000);
