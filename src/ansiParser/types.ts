export enum TokenType {
    EOF,
    CSI,
    Newline,
    Text,
}

export interface ITokenBase {
    type: TokenType;
}

export interface ITokenEOF extends ITokenBase {
    type: TokenType.EOF;
}

export interface ITokenCSI extends ITokenBase {
    type: TokenType.CSI;
    attrs: string[];
}

export interface ITokenNewline extends ITokenBase {
    type: TokenType.Newline;
}

export interface ITokenText extends ITokenBase {
    type: TokenType.Text;
    value: string;
}

export type IToken = ITokenEOF | ITokenCSI | ITokenNewline | ITokenText;
