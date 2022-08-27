import type { ParserBuffer } from './buffer';

export interface ICharRef {
    current: number;
}

export interface IParserContextBase {
    buffer: ParserBuffer;
    charRef: ICharRef;
}
