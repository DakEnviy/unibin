import net from 'net';

import { config } from './config';
import { startCleanFilesJob } from './startCleanFilesJob';
import { makeCreateTermFileStream } from './createFile';

const server = net.createServer();

server.maxConnections = config.maxConnections;

server.on('connection', socket => {
    socket.setTimeout(config.socketTimeout);

    const createTermFileStream = makeCreateTermFileStream();
    let fileSize = 0;

    // Go to first yield
    createTermFileStream.next();

    socket.on('data', data => {
        fileSize += data.byteLength;

        // TODO(DakEnviy): Think about it
        if (fileSize > config.maxFileSize) {
            // @ts-ignore
            createTermFileStream.return();
            socket.end(`File size should be less than ${config.maxFileSize} bytes\b`);

            return;
        }

        try {
            createTermFileStream.next(data);
        } catch (error) {
            console.error('Failed to handle data chunk');
            console.error(error);
        }
    });

    // TODO(DakEnviy): Test: close connection before timeout event has been invoked
    socket.on('timeout', () => {
        try {
            const result = createTermFileStream.next();

            // TODO(DakEnviy): Think about corner cases
            if (result.done && result.value) {
                socket.end(`${result.value}\n`);
            }
        } catch (error) {
            console.error('Failed to get result from create term file stream');
            console.error(error);
        }
    });
});

server.on('listening', () => {
    console.info(`UniBin server has started on port ${config.port}`);

    startCleanFilesJob();
});

server.listen(config.port);
