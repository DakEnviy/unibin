import { SgrTokenType } from './constants';

export interface ISgrTokenBase {
    type: SgrTokenType;
}

export interface ISgrTokenAttribute extends ISgrTokenBase {
    type: SgrTokenType.Attribute;
    value: number;
}

export interface ISgrTokenSelf extends ISgrTokenBase {
    type: SgrTokenType.Self;
    attributes: number[];
}

export type ISgrToken = ISgrTokenAttribute | ISgrTokenSelf;
