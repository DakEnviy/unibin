import net from 'net';

import { config } from './config';
import { createFile } from './createFile';

const server = net.createServer();

server.maxConnections = config.maxConnections;

server.on('connection', socket => {
    socket.setTimeout(config.socketTimeout);

    const fileParts: Buffer[] = [];
    let fileSize = 0;

    const appendFilePart = (part: Buffer) => {
        fileSize += part.byteLength;

        if (fileSize > config.maxFileSize) {
            socket.end(`File size should be less than ${config.maxFileSize} bytes\b`);

            return;
        }

        fileParts.push(part);
    };

    socket.on('data', data => {
        appendFilePart(data);
    });

    socket.on('timeout', async () => {
        const fileUrl = await createFile(fileParts);

        socket.end(`${fileUrl}\n`);
    });
});

server.on('listening', () => {
    console.info(`Server listening on port ${config.port}`);
});

server.listen(config.port);
