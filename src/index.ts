import * as http from 'http';

const PORT = Number(process.env.PORT) || 3000;

const httpServer = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress?.split(':').pop() || 'unknown';

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Your IP: ${ip}`);
});

httpServer.listen(PORT, () => {
    console.info(`Server listening on port ${PORT}`);
});
