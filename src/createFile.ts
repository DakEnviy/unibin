import fs from 'fs';
import path from 'path';

const FILENAME_LENGTH = Number(process.env.FILENAME_LENGTH) || 8;
const FILES_DIR = process.env.FILES_DIR || 'files';
const BASE_URL = process.env.DOMAIN || 'https://example.com';

const filesDirPath = path.join(__dirname, '..', FILES_DIR);

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
    const filename = generateFilename(FILENAME_LENGTH);
    const fileUrl = `${BASE_URL}/${filename}`;

    await writeFileParts(path.join(filesDirPath, filename), fileParts);

    return fileUrl;
};
