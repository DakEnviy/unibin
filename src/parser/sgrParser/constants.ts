import { char } from '../lib/utils';

export const ESC = char('\x1B');
export const CSI_2 = char('[');
export const SGR_DELIMITER = char(';');
export const SGR_END = char('m');

export enum SgrParserState {
    Start = 'start',
    Escape = 'escape',
    Csi = 'csi',
    SgrAttribute = 'sgrAttribute',
    SgrDelimiter = 'sgrDelimiter',
    SgrEnd = 'sgrEnd',
}
