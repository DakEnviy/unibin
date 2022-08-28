import type { IEscapeToken } from '../../escapeParser/tokens/types';
import type { IAnsiTokenCarriageReturn, IAnsiTokenNewline, IAnsiTokenEscape, IAnsiTokenText } from './types';
import { AnsiTokenType } from './constants';

export const makeAnsiEscapeToken = (token: IEscapeToken): IAnsiTokenEscape => {
    return { type: AnsiTokenType.Escape, token };
};

export const makeAnsiNewlineToken = (): IAnsiTokenNewline => {
    return { type: AnsiTokenType.Newline };
};

export const makeAnsiCarriageReturnToken = (): IAnsiTokenCarriageReturn => {
    return { type: AnsiTokenType.CarriageReturn };
};

export const makeAnsiTextToken = (text: string): IAnsiTokenText => {
    return { type: AnsiTokenType.Text, text };
};
