import type { IEscapeTokenParameter, IEscapeTokenSgr } from './types';
import { EscapeTokenType } from './constants';

export const makeEscapeParameterToken = (value: number = 0): IEscapeTokenParameter => {
    return { type: EscapeTokenType.Parameter, value };
};

export const makeEscapeSgrToken = (attributes: number[]): IEscapeTokenSgr => {
    return { type: EscapeTokenType.Sgr, attributes };
};
