import fs from 'fs';
import path from 'path';

import { config } from './config';

const generateFilename = (length: number): string => {
    let filename = '';

    while (filename.length < length) {
        filename += Math.random().toString(36).substring(2);
    }

    return filename.substring(0, length);
};

const writeFileParts = async (filepath: string, parts: Buffer[]) => {
    const dirpath = path.dirname(filepath);

    if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
    } else if (!fs.existsSync(dirpath)) {
        await fs.promises.mkdir(dirpath, { recursive: true });
    }

    for (const part of parts) {
        await fs.promises.appendFile(filepath, part);
    }
};

export const createFile = async (fileParts: Buffer[]) => {
    const filename = generateFilename(config.filenameLength);
    const fileUrl = `${config.baseUrl}/${filename}`;

    await writeFileParts(path.join(config.filesDirPath, filename), fileParts);

    return fileUrl;
};
