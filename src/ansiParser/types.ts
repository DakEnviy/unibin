import type { IToken } from './tokens/types';
import { ParserBuffer } from './buffer';

export interface IAnsiParserContext {
    tokens: IToken[];
    buffer: ParserBuffer;
    char: number;
}
