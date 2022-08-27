import type { IAnsiToken } from './tokens/types';
import type { IParserContextBase } from '../lib/types';
import type { ISgrParserContext } from '../sgrParser/types';

export interface IAnsiParserContext extends IParserContextBase {
    sgrParserContext: ISgrParserContext;
    tokens: IAnsiToken[];
}
