import type { IParserContextBase } from '../lib/types';
import type { IEscapeToken } from './tokens/types';

export interface IEscapeParserContext extends IParserContextBase {
    tokens: IEscapeToken[];
}
