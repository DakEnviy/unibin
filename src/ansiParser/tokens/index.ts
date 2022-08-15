import type { ITokenNewline, ITokenSGR, ITokenText } from './types';
import { TokenType } from './constants';

export const makeSGRToken = (attrs: string[]): ITokenSGR => {
    return { type: TokenType.SGR, attrs };
};

export const makeNewlineToken = (): ITokenNewline => {
    return { type: TokenType.Newline };
};

export const makeTextToken = (text: string): ITokenText => {
    return { type: TokenType.Text, text };
};
