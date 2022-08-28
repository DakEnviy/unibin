import type { IAnsiToken } from './tokens/types';
import type { IParserContextBase } from '../lib/types';
import type { IEscapeParserContext } from '../escapeParser/types';

export interface IAnsiParserContext extends IParserContextBase {
    escapeParserContext: IEscapeParserContext;
    tokens: IAnsiToken[];
}
