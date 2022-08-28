import { char } from '../lib/utils';

export const CR = char('\r');
export const LF = char('\n');

export enum AnsiParserState {
    Start = 'start',
    Escape = 'escape',
    Cr = 'cr',
    Lf = 'lf',
    Text = 'text',
}
