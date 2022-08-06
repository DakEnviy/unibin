import net from 'net';

import { createFile } from './createFile';

const PORT = Number(process.env.PORT) || 9999;
const MAX_CONNECTIONS = Number(process.env.MAX_CONNECTIONS) || 64;
const SOCKET_TIMEOUT = Number(process.env.SOCKET_TIMEOUT) || 3000;

const server = net.createServer();

server.maxConnections = MAX_CONNECTIONS;

server.on('connection', socket => {
    socket.setTimeout(SOCKET_TIMEOUT);

    const fileParts: Buffer[] = [];

    socket.on('data', data => {
        fileParts.push(data);
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
