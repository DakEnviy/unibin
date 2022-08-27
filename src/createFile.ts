import fs from 'fs';
import path from 'path';

import { config } from './config';
import { makeBufferAnsiParser } from './parser/ansiParser';
import type { IAnsiToken } from './parser/ansiParser/tokens/types';

const generateFilename = (length: number): string => {
    let filename = '';

    while (filename.length < length) {
        filename += Math.random().toString(36).substring(2);
    }

    return filename.substring(0, length);
};

const writeFile = async (filepath: string, content: Buffer) => {
    const dirpath = path.dirname(filepath);

    if (!fs.existsSync(dirpath)) {
        await fs.promises.mkdir(dirpath, { recursive: true });
    }

    console.log(content.toString());

    const parts = [content];
    const parser = makeBufferAnsiParser();

    let index = -1;
    const tokens: IAnsiToken[] = [];

    while (true) {
        // TODO(DakEnviy): Add handling of parser errors
        const result = parser.next(index < parts.length ? parts[index] : undefined);

        if (result.done) {
            break;
        }

        if (result.value) {
            tokens.push(result.value);
        } else {
            ++index;
        }
    }

    console.log(tokens);

    await fs.promises.writeFile(filepath, content);
};

export const createFile = async (content: Buffer): Promise<string> => {
    const filename = generateFilename(config.filenameLength);
    const filepath = path.join(config.filesDirPath, filename);

    if (fs.existsSync(filepath)) {
        return createFile(content);
    }

    await writeFile(path.join(config.filesDirPath, filename), content);

    return `${config.baseUrl}/${filename}`;
};
