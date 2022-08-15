export enum TokenType {
    SGR,
    Newline,
    Text,
}

export interface ITokenBase {
    type: TokenType;
}

export interface ITokenSGR extends ITokenBase {
    type: TokenType.SGR;
    attrs: string[];
}

export interface ITokenNewline extends ITokenBase {
    type: TokenType.Newline;
}

export interface ITokenText extends ITokenBase {
    type: TokenType.Text;
    value: string;
}

export type IToken = ITokenSGR | ITokenNewline | ITokenText;
