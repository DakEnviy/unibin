import path from 'path';

export const config = {
    port: Number(process.env.PORT) || 9999,
    maxConnections: Number(process.env.MAX_CONNECTIONS) || 64,
    socketTimeout: Number(process.env.SOCKET_TIMEOUT) || 3000, // in milliseconds, default: 3 seconds
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // in bytes, default: 10 MB
    filenameLength: Number(process.env.FILENAME_LENGTH) || 8,
    filesDirPath: path.join(__dirname, '..', process.env.FILES_DIR || 'files'),
    baseUrl: process.env.BASE_URL || 'https://example.com',
    maxFiles: Number(process.env.MAX_FILES) || 64,
    fileLifetime: Number(process.env.FILE_FILETIME) || 24 * 60 * 60, // in seconds, default: 1 day
    cleanTimeout: Number(process.env.CLEAN_TIMEOUT) || 5 * 60, // in seconds, default: 5 minutes
    // TODO(DakEnviy): Think about buffer size
    bufferSize: Number(process.env.BUFFER_SIZE) || 1024, // in bytes, default: 1 KB
};
