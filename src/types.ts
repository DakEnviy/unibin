import type { PathLike, Stats } from 'fs';

export interface IPathWithStat {
    path: PathLike;
    stat: Stats;
}
