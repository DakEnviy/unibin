import type { AnsiTokenType } from './constants';

export interface IAnsiTokenBase {
    type: AnsiTokenType;
}

export interface IAnsiTokenSgr extends IAnsiTokenBase {
    type: AnsiTokenType.Sgr;
    attributes: number[];
}

export interface IAnsiTokenNewline extends IAnsiTokenBase {
    type: AnsiTokenType.Newline;
}

export interface IAnsiTokenText extends IAnsiTokenBase {
    type: AnsiTokenType.Text;
    text: string;
}

export type IAnsiToken = IAnsiTokenSgr | IAnsiTokenNewline | IAnsiTokenText;
