import { config } from '../../config';
import { ParserBuffer } from '../lib/buffer';
import type { IAnsiToken } from './tokens/types';
import { makeNewlineToken, makeSgrToken, makeTextToken } from './tokens';
import type { IAnsiParserContext } from './types';
import { FiniteStateMachine } from '../lib/fsm';
import { CR, LF } from './constants';
import { EOF } from '../lib/constants';
import { sgrParserMachine } from '../sgrParser';
import type { ICharRef } from '../lib/types';
import { SgrTokenType } from '../sgrParser/tokens/constants';

const startNext = (context: IAnsiParserContext) => {
    switch (context.charRef.current) {
    case EOF:
        return 'start';
    case CR:
        return 'cr';
    case LF:
        return 'lf';
    }

    if (sgrParserMachine.next(context.sgrParserContext) !== undefined) {
        return 'sgr';
    }

    // TODO(DakEnviy): Make condition for text to filter it
    return 'text';
};

// TODO(DakEnviy): Think about constructor
const ansiParserMachine = new FiniteStateMachine({
    start: {
        next: startNext,
    },
    sgr: {
        next: (context: IAnsiParserContext) => {
            if (sgrParserMachine.current === 'sgrEnd') {
                sgrParserMachine.gotoStart(context.sgrParserContext);

                return startNext(context);
            }

            if (sgrParserMachine.next(context.sgrParserContext) === undefined) {
                // TODO(DakEnviy): Make error
                throw 'Undefined behavior';
            }

            return 'sgr';
        },
        onExit: (context: IAnsiParserContext) => {
            for (const token of context.sgrParserContext.tokens) {
                if (token.type !== SgrTokenType.Self) {
                    // TODO(DakEnviy): Make error
                    throw 'Not SGR token';
                }

                context.tokens.push(makeSgrToken(token.attributes));
            }

            context.sgrParserContext.tokens.length = 0;
        },
    },
    cr: {
        next: (context: IAnsiParserContext) => {
            if (context.charRef.current === LF) {
                return 'lf';
            }
        },
    },
    lf: {
        next: startNext,
        onExit: (context: IAnsiParserContext) => {
            context.buffer.flush();
            context.tokens.push(makeNewlineToken());
        },
    },
    text: {
        next: startNext,
        onExit: (context: IAnsiParserContext) => {
            const text = Buffer.from(context.buffer.flush()).toString();

            context.tokens.push(makeTextToken(text));
        },
    },
}, 'start');

export const makeAnsiParser = function*() {
    const buffer = new ParserBuffer(config.bufferSize);
    const charRef: ICharRef = { current: EOF };

    const context: IAnsiParserContext = {
        buffer,
        charRef,
        sgrParserContext: {
            buffer,
            charRef,
            tokens: [],
        },
        tokens: [],
    };

    while (true) {
        const char: number = yield;

        context.charRef.current = char;
        const stateKey = ansiParserMachine.next(context);

        if (stateKey === undefined) {
            // TODO(DakEnviy): Make error
            throw 'Undefined behavior';
        }

        context.buffer.write(char);
        context.charRef.current = EOF;

        let token: IAnsiToken | undefined;

        while (token = context.tokens.shift()) {
            yield token;
        }

        if (stateKey === 'start') {
            return;
        }
    }
};
