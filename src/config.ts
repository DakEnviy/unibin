import path from 'path';

export const config = {
    port: Number(process.env.PORT) || 9999,
    maxConnections: Number(process.env.MAX_CONNECTIONS) || 64,
    socketTimeout: Number(process.env.SOCKET_TIMEOUT) || 3000, // 3 seconds
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10 MB
    filenameLength: Number(process.env.FILENAME_LENGTH) || 8,
    filesDirPath: path.join(__dirname, '..', process.env.FILES_DIR || 'files'),
    baseUrl: process.env.DOMAIN || 'https://example.com',
};
