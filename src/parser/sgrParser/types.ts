import type { IParserContextBase } from '../lib/types';
import type { ISgrToken } from './tokens/types';

export interface ISgrParserContext extends IParserContextBase {
    tokens: ISgrToken[];
}
