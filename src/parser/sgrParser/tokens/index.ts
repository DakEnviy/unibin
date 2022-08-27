import type { ISgrTokenAttribute, ISgrTokenSelf } from './types';
import { SgrTokenType } from './constants';

export const makeSgrAttributeToken = (value: number): ISgrTokenAttribute => {
    return { type: SgrTokenType.Attribute, value };
};

export const makeSgrSelfToken = (attributes: number[]): ISgrTokenSelf => {
    return { type: SgrTokenType.Self, attributes };
};
