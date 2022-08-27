import { config } from '../../config';
import { ParserBuffer } from '../lib/buffer';
import type { IAnsiToken } from './tokens/types';
import { makeNewlineToken, makeSgrToken, makeTextToken } from './tokens';
import type { IAnsiParserContext } from './types';
import { FiniteStateMachine } from '../lib/fsm';
import { AnsiParserState, CR, LF } from './constants';
import { EOF } from '../lib/constants';
import type { ICharRef } from '../lib/types';
import { SgrTokenType } from '../sgrParser/tokens/constants';
import { SgrParserState } from '../sgrParser/constants';
import { ParserError } from '../lib/errors';
import { makeSgrParserMachine } from '../sgrParser';

export const makeAnsiParserMachine = () => {
    const sgrParserMachine = makeSgrParserMachine();

    const startNext = (context: IAnsiParserContext) => {
        switch (context.charRef.current) {
        case EOF:
            return AnsiParserState.Start;
        case CR:
            return AnsiParserState.Cr;
        case LF:
            return AnsiParserState.Lf;
        }

        if (sgrParserMachine.next(context.sgrParserContext) !== undefined) {
            return AnsiParserState.Sgr;
        }

        // TODO(DakEnviy): Make condition for text to filter it
        return AnsiParserState.Text;
    };

    return new FiniteStateMachine<AnsiParserState, IAnsiParserContext>({
        start: {
            next: startNext,
        },
        sgr: {
            next: context => {
                if (sgrParserMachine.current === SgrParserState.SgrEnd) {
                    sgrParserMachine.gotoStart(context.sgrParserContext);

                    return startNext(context);
                }

                if (sgrParserMachine.next(context.sgrParserContext) === undefined) {
                    throw new ParserError('Undefined behavior');
                }

                return AnsiParserState.Sgr;
            },
            onExit: context => {
                for (const token of context.sgrParserContext.tokens) {
                    if (token.type !== SgrTokenType.Self) {
                        throw new ParserError(`Expected SGR token, but got: ${token.type}`);
                    }

                    context.tokens.push(makeSgrToken(token.attributes));
                }

                context.sgrParserContext.tokens.length = 0;
            },
        },
        cr: {
            next: context => {
                if (context.charRef.current === LF) {
                    return AnsiParserState.Lf;
                }
            },
        },
        lf: {
            next: startNext,
            onExit: context => {
                context.buffer.flush();
                context.tokens.push(makeNewlineToken());
            },
        },
        text: {
            next: startNext,
            onExit: context => {
                const text = Buffer.from(context.buffer.flush()).toString();

                context.tokens.push(makeTextToken(text));
            },
        },
    }, AnsiParserState.Start);
};

export const makeAnsiParser = function*() {
    const ansiParserMachine = makeAnsiParserMachine();

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
            throw new ParserError('Undefined behavior');
        }

        context.buffer.write(char);
        context.charRef.current = EOF;

        let token: IAnsiToken | undefined;

        while (token = context.tokens.shift()) {
            yield token;
        }

        if (stateKey === AnsiParserState.Start) {
            return;
        }
    }
};

// TODO(DakEnviy): Update typescript to latest version
export const makeBufferAnsiParser = function*() {
    const ansiParser = makeAnsiParser();

    while (true) {
        const part: Uint8Array | undefined = yield;

        let index = -1;

        while (true) {
            const char = part && index >= 0 ? part[index] : EOF;

            if (char === undefined) {
                break;
            }

            const result = ansiParser.next(char);

            if (result.done) {
                return;
            }

            if (result.value) {
                yield result.value;
            } else {
                ++index;
            }
        }
    }
};
