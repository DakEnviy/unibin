import fs from 'fs';
import path from 'path';

import { config } from './config';
import { makeTermFileStream } from './stream';

const generateFilename = (length: number): string => {
    let filename = '';

    while (filename.length < length) {
        filename += Math.random().toString(36).substring(2);
    }

    return filename.substring(0, length);
};

const generateFilenameStrict = (length: number): string => {
    const filename = generateFilename(length);

    if (fs.existsSync(path.join(config.filesDirPath, filename))) {
        return generateFilenameStrict(length);
    }

    return filename;
};

export const makeCreateTermFileStream = function*(): Generator<undefined, string | void, Uint8Array | undefined> {
    const filename = generateFilenameStrict(config.filenameLength);

    const termFileStream = makeTermFileStream(filename);
    const writeStream = fs.createWriteStream(path.join(config.filesDirPath, filename), 'utf-8');

    let part: Uint8Array | undefined = undefined;

    while (true) {
        const result = termFileStream.next(part);

        if (result.done) {
            writeStream.end();

            return `${config.baseUrl}/${filename}`;
        }

        if (result.value) {
            writeStream.write(result.value, 'utf-8');
        } else {
            part = yield;
        }
    }
};
