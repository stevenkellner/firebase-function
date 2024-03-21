import { waitUntilUsed } from 'tcp-port-used';

async function waitForEmulators(): Promise<void> {
    await waitUntilUsed(8080, 500, 60000);
    await waitUntilUsed(9000, 500, 60000);
    await new Promise(resolve => {
        setTimeout(resolve, 3000);
    });
}

void waitForEmulators();
