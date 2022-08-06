import net from 'net';

import { createFile } from './createFile';

const PORT = Number(process.env.PORT) || 9999;
const MAX_CONNECTIONS = Number(process.env.MAX_CONNECTIONS) || 64;
const SOCKET_TIMEOUT = Number(process.env.SOCKET_TIMEOUT) || 3000; // 3 seconds
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10 MB

const server = net.createServer();

server.maxConnections = MAX_CONNECTIONS;

server.on('connection', socket => {
    socket.setTimeout(SOCKET_TIMEOUT);

    const fileParts: Buffer[] = [];
    let fileSize = 0;

    const appendFilePart = (part: Buffer) => {
        fileSize += part.byteLength;

        if (fileSize > MAX_FILE_SIZE) {
            socket.end(`File size should be less than ${MAX_FILE_SIZE} bytes\b`);

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
    console.info(`Server listening on port ${PORT}`);
});

server.listen(PORT);
