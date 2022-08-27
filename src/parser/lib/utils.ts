import { ParserError } from './errors';

export const char = (char: string): number => {
    return char.charCodeAt(0);
};

const CHAR_CODE_0 = char('0');
const CHAR_CODE_9 = char('9');

export const isCharNumeric = (char: number): boolean => {
    return CHAR_CODE_0 <= char && char <= CHAR_CODE_9;
};

export const charToDigit = (char: number): number => {
    if (!isCharNumeric(char)) {
        throw new ParserError(`Expected numeric char, but got char with code: ${char}`);
    }

    return char - CHAR_CODE_0;
};

export const bufferToNumber = (buffer: Uint8Array): number => {
    let result = 0;
    let base = 1;

    for (let i = 1; i <= buffer.length; ++i) {
        result += charToDigit(buffer[buffer.length - i]) * base;
        base *= 10;
    }

    return result;
};
