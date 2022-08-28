import { EscapeTokenType } from './constants';

export interface IEscapeTokenBase {
    type: EscapeTokenType;
}

export interface IEscapeTokenParameter extends IEscapeTokenBase {
    type: EscapeTokenType.Parameter;
    value: number;
}

export interface IEscapeTokenSgr extends IEscapeTokenBase {
    type: EscapeTokenType.Sgr;
    attributes: number[];
}

export type IEscapeToken = IEscapeTokenParameter | IEscapeTokenSgr;
