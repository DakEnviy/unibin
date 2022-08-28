import { char } from '../lib/utils';

export const ESC = char('\x1B');
export const DELIMITER = char(';');

export const CSI = char('[');
export const RI = char('M');
export const ENC = char('%');

export const CUU = char('A');
export const CUD = char('B');
export const CUF = char('C');
export const CUB = char('D');
export const CNL = char('E');
export const CPL = char('F');
export const CHA = char('G');
export const CUP = char('H');
export const ED = char('J');
export const EL = char('K');
export const SU = char('S');
export const SD = char('T');
export const HVP = char('f');
export const SGR = char('m');

export const ENC_DEFAULT = char('@');
export const ENC_UTF8 = char('G');

export enum EscapeParserState {
    Start = 'start',
    Escape = 'escape',
    Parameter = 'parameter',
    Delimiter = 'delimiter',
    Csi = 'csi',
    Cuu = 'cuu',
    Cud = 'cud',
    Cuf = 'cuf',
    Cub = 'cub',
    Cnl = 'cnl',
    Cpl = 'cpl',
    Cha = 'cha',
    Cup = 'cup',
    Ed = 'ed',
    El = 'el',
    Su = 'su',
    Sd = 'sd',
    Hvp = 'hvp',
    Sgr = 'sgr',
    Ri = 'ri',
    Enc = 'enc',
    EncValue = 'encValue',
}
