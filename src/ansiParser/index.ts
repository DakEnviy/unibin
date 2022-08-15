import { config } from '../config';
import { ParserBuffer } from './buffer';
import { char, isCharNumeric } from './utils';
import type { IToken } from './tokens/types';
import { makeNewlineToken, makeSGRToken, makeTextToken } from './tokens';
import type { IAnsiParserContext } from './types';
import { FiniteStateMachine } from './fsm';

const EOF = -1;
const ESC = char('\x1B');
const CSI_2 = char('[');
const SGR_DELIMITER = char(';');
const SGR_END = char('m');
const CR = char('\r');
const LF = char('\n');

const startNext = (context: IAnsiParserContext) => {
    switch (context.char) {
    case EOF:
        return 'eof';
    case ESC:
        return 'escape';
    case CR:
        return 'cr';
    case LF:
        return 'lf';
    default:
        return 'text';
    }
};

const machine = new FiniteStateMachine({
    start: {
        next: startNext,
    },
    escape: {
        next: (context: IAnsiParserContext) => {
            if (context.char === CSI_2) {
                return 'csi';
            }
        },
    },
    csi: {
        next: (context: IAnsiParserContext) => {
            if (isCharNumeric(context.char)) {
                return 'sgrParameter';
            }

            if (context.char === SGR_END) {
                return 'sgrEnd';
            }
        },
    },
    sgrParameter: {
        next: (context: IAnsiParserContext) => {
            if (isCharNumeric(context.char)) {
                return 'sgrParameter';
            }

            if (context.char === SGR_DELIMITER) {
                return 'sgrDelimiter';
            }

            if (context.char === SGR_END) {
                return 'sgrEnd';
            }
        },
    },
    sgrDelimiter: {
        next: (context: IAnsiParserContext) => {
            if (isCharNumeric(context.char)) {
                return 'sgrParameter';
            }
        },
    },
    sgrEnd: {
        next: startNext,
        onExit: (context: IAnsiParserContext) => {
            // TODO(DakEnviy): Replace buffer
            const text = Buffer.from(context.buffer.flush()).toString();
            context.tokens.push(makeSGRToken([text]));
        },
    },
    cr: {
        next: (context: IAnsiParserContext) => {
            if (context.char === LF) {
                return 'lf';
            }
        },
    },
    lf: {
        next: startNext,
        onExit: (context: IAnsiParserContext) => {
            context.tokens.push(makeNewlineToken());
        },
    },
    text: {
        next: startNext,
        onExit: (context: IAnsiParserContext) => {
            // TODO(DakEnviy): Replace buffer
            const text = Buffer.from(context.buffer.flush()).toString();
            context.tokens.push(makeTextToken(text));
        },
    },
    eof: {
        next: (_context: IAnsiParserContext) => 'start',
    },
}, 'start', 'eof');

export const makeAnsiParser = function*() {
    const context: IAnsiParserContext = {
        tokens: [],
        buffer: new ParserBuffer(config.bufferSize),
        char: EOF,
    };

    while (true) {
        const char: number = yield;

        context.char = char;
        const isEnd = machine.next(context);

        context.buffer.write(char);
        context.char = EOF;

        let token: IToken | undefined;

        while (token = context.tokens.shift()) {
            yield token;
        }

        if (isEnd) {
            return;
        }
    }
};
