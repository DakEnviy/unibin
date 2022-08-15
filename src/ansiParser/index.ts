import { config } from '../config';
import { AnsiParserBuffer } from './buffer';
import { char, isCharNumeric } from './utils';
import type { IToken } from './tokens/types';
import { makeNewlineToken, makeSGRToken, makeTextToken } from './tokens';

const EOF = -1;
const ESC = char('\x1B');
const CSI_2 = char('[');
const SGR_DELIMITER = char(';');
const SGR_END = char('m');
const CR = char('\r');
const LF = char('\n');

interface IState<TStateKeys extends string, TContext> {
    next: (context: TContext) => TStateKeys | void;
    onJoin?: (context: TContext) => void;
    onExit?: (context: TContext) => void;
}

type IStates<TStateKeys extends string, TContext> = {
    [P in TStateKeys]: IState<TStateKeys, TContext>;
};

class FiniteStateMachine<TStateKeys extends string, TContext> {
    private readonly states: IStates<TStateKeys, TContext>;
    private readonly endStateKey: TStateKeys;

    private currentStateKey: TStateKeys;

    constructor(states: IStates<TStateKeys, TContext>, startStateKey: TStateKeys, endStateKey: TStateKeys) {
        this.states = states;
        this.currentStateKey = startStateKey;
        this.endStateKey = endStateKey;
    }

    next(context: TContext) {
        const currentState = this.states[this.currentStateKey];
        const nextStateKey = currentState.next(context);

        if (!nextStateKey) {
            // TODO(DakEnviy): Make error
            throw 'Undefined behavior';
        }

        if (nextStateKey !== this.currentStateKey) {
            currentState.onExit?.(context);
            this.states[nextStateKey].onJoin?.(context);
        }

        this.currentStateKey = nextStateKey;

        return this.isEnd();
    }

    isEnd() {
        return this.currentStateKey === this.endStateKey;
    }
}

interface IAnsiParserContext {
    tokens: IToken[];
    buffer: AnsiParserBuffer;
    char: number;
}

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

export const makeAnsiParserGen = function*() {
    const context: IAnsiParserContext = {
        tokens: [],
        buffer: new AnsiParserBuffer(config.bufferSize),
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
