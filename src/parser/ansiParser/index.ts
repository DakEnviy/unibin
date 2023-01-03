import { TextDecoder } from 'util';

import { config } from '../../config';
import { ParserBuffer } from '../lib/buffer';
import type { IAnsiToken } from './tokens/types';
import { makeAnsiCarriageReturnToken, makeAnsiNewlineToken, makeAnsiEscapeToken, makeAnsiTextToken } from './tokens';
import type { IAnsiParserContext } from './types';
import { FiniteStateMachine } from '../lib/fsm';
import { AnsiParserState, CR, LF } from './constants';
import { EOF } from '../lib/constants';
import type { ICharRef } from '../lib/types';
import { EscapeTokenType } from '../escapeParser/tokens/constants';
import { ParserError } from '../lib/errors';
import { isEndEscapeStateKey, makeEscapeParserMachine } from '../escapeParser';

const textDecoder = new TextDecoder('utf-8');

export const makeAnsiParserMachine = () => {
    const escapeParserMachine = makeEscapeParserMachine();

    const startNext = (context: IAnsiParserContext) => {
        switch (context.charRef.current) {
        case EOF:
            return AnsiParserState.Start;
        case CR:
            return AnsiParserState.Cr;
        case LF:
            return AnsiParserState.Lf;
        }

        if (escapeParserMachine.next(context.escapeParserContext) !== undefined) {
            return AnsiParserState.Escape;
        }

        // TODO(DakEnviy): Make condition for text to filter it
        return AnsiParserState.Text;
    };

    return new FiniteStateMachine<AnsiParserState, IAnsiParserContext>({
        start: {
            next: startNext,
        },
        escape: {
            next: context => {
                if (isEndEscapeStateKey(escapeParserMachine.current)) {
                    escapeParserMachine.gotoStart(context.escapeParserContext);

                    return startNext(context);
                }

                if (escapeParserMachine.next(context.escapeParserContext) === undefined) {
                    throw new ParserError('Undefined behavior');
                }

                return AnsiParserState.Escape;
            },
            onExit: context => {
                for (const token of context.escapeParserContext.tokens) {
                    if (token.type === EscapeTokenType.Parameter) {
                        throw new ParserError(`Got unexpected parameter token with value: ${token.value}`);
                    }

                    context.tokens.push(makeAnsiEscapeToken(token));
                }

                context.escapeParserContext.tokens.length = 0;
            },
        },
        cr: {
            next: context => {
                if (context.charRef.current === LF) {
                    return AnsiParserState.Lf;
                }

                return startNext(context);
            },
            onExit: (context, to) => {
                if (to !== AnsiParserState.Lf) {
                    context.buffer.flush();
                    context.tokens.push(makeAnsiCarriageReturnToken());
                }
            },
        },
        lf: {
            next: startNext,
            onExit: context => {
                context.buffer.flush();
                context.tokens.push(makeAnsiNewlineToken());
            },
        },
        text: {
            next: startNext,
            onExit: context => {
                const text = textDecoder.decode(context.buffer.flush());

                context.tokens.push(makeAnsiTextToken(text));
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
        escapeParserContext: {
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

export const makeAnsiBufferParser = function*() {
    const ansiParser = makeAnsiParser();

    let part: Uint8Array | undefined = undefined;
    let index = 0;

    while (true) {
        const char = part?.[index] ?? EOF;
        const result = ansiParser.next(char);

        if (result.done) {
            return;
        }

        if (result.value) {
            yield result.value;
        } else if (!part || index === part.byteLength - 1) {
            part = yield;
            index = 0;
        } else {
            ++index;
        }
    }
};
