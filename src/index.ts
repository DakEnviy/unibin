import net from 'net';

import { config } from './config';
import { createFile } from './createFile';
import { startCleanFilesJob } from './startCleanFilesJob';

const server = net.createServer();

server.maxConnections = config.maxConnections;

server.on('connection', socket => {
    socket.setTimeout(config.socketTimeout);

    const parts: Buffer[] = [];
    let size = 0;

    const appendFilePart = (part: Buffer) => {
        size += part.byteLength;

        if (size > config.maxFileSize) {
            socket.end(`File size should be less than ${config.maxFileSize} bytes\b`);

            return;
        }

        parts.push(part);
    };

    socket.on('data', data => {
        appendFilePart(data);
    });

    socket.on('timeout', async () => {
        const url = await createFile(Buffer.concat(parts));

        socket.end(`${url}\n`);
    });
});

server.on('listening', () => {
    console.info(`UniBin server has started on port ${config.port}`);

    startCleanFilesJob();
});

server.listen(config.port);
