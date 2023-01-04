import type { IParserContextBase } from '../lib/types';
import type { IEscapeTokenInternal } from './tokens/types';

export interface IEscapeParserContext extends IParserContextBase {
    tokens: IEscapeTokenInternal[];
}
