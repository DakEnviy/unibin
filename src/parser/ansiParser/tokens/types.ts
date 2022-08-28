import type { IEscapeToken } from '../../escapeParser/tokens/types';
import type { AnsiTokenType } from './constants';

export interface IAnsiTokenBase {
    type: AnsiTokenType;
}

export interface IAnsiTokenEscape extends IAnsiTokenBase {
    type: AnsiTokenType.Escape;
    token: IEscapeToken;
}

export interface IAnsiTokenNewline extends IAnsiTokenBase {
    type: AnsiTokenType.Newline;
}

export interface IAnsiTokenCarriageReturn extends IAnsiTokenBase {
    type: AnsiTokenType.CarriageReturn;
}

export interface IAnsiTokenText extends IAnsiTokenBase {
    type: AnsiTokenType.Text;
    text: string;
}

export type IAnsiToken = IAnsiTokenEscape | IAnsiTokenNewline | IAnsiTokenCarriageReturn | IAnsiTokenText;
