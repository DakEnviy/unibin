import { char } from '../lib/utils';

export const CR = char('\r');
export const LF = char('\n');

export enum AnsiParserState {
    Start = 'start',
    Sgr = 'sgr',
    Cr = 'cr',
    Lf = 'lf',
    Text = 'text',
}
