import type { IAnsiTokenNewline, IAnsiTokenSgr, IAnsiTokenText } from './types';
import { AnsiTokenType } from './constants';

export const makeSgrToken = (attributes: number[]): IAnsiTokenSgr => {
    return { type: AnsiTokenType.Sgr, attributes };
};

export const makeNewlineToken = (): IAnsiTokenNewline => {
    return { type: AnsiTokenType.Newline };
};

export const makeTextToken = (text: string): IAnsiTokenText => {
    return { type: AnsiTokenType.Text, text };
};
