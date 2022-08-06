import fs from 'fs';
import path from 'path';

import { config } from './config';
import type { IPathWithStat } from './types';

/**
 * Files should be sorted by modified time
 */
const findOldFilesByLimit = (files: IPathWithStat[]): fs.PathLike[] => {
    return files.splice(config.maxFiles).map(file => file.path);
};

const findOldFilesByAge = (files: IPathWithStat[]): fs.PathLike[] => {
    const now = Date.now();

    return files.filter(file => file.stat.mtime.getTime() + config.fileLifetime * 1000 < now).map(file => file.path);
};

const cleanFiles = async () => {
    try {
        const filenames = await fs.promises.readdir(config.filesDirPath)

        const files = await Promise.all<IPathWithStat>(filenames.map(async filename => {
            const filepath = path.join(config.filesDirPath, filename);

            return {
                path: filepath,
                stat: await fs.promises.stat(filepath),
            };
        }));

        files.sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

        const oldFiles = [...new Set([...findOldFilesByLimit(files), ...findOldFilesByAge(files)])];

        await Promise.all(oldFiles.map(filepath => fs.promises.unlink(filepath)));

        return oldFiles;
    } catch {
        // TODO(DakEnviy): Add logging and / or handling
    }
};

export const startCleanFilesJob = () => {
    // noinspection JSIgnoredPromiseFromCall
    cleanFiles();

    setInterval(cleanFiles, config.cleanTimeout * 1000);
};
