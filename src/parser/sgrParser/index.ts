import { FiniteStateMachine } from '../lib/fsm';
import { bufferToNumber, isCharNumeric } from '../lib/utils';
import type { ISgrParserContext } from './types';
import { CSI_2, ESC, SGR_DELIMITER, SGR_END, SgrParserState } from './constants';
import { makeSgrAttributeToken, makeSgrSelfToken } from './tokens';
import { SgrTokenType } from './tokens/constants';
import type { ISgrToken } from './tokens/types';
import { EOF } from '../lib/constants';

export const makeSgrParserMachine = () => {
    const startNext = (context: ISgrParserContext) => {
        switch (context.charRef.current) {
        case EOF:
            return SgrParserState.Start;
        case ESC:
            return SgrParserState.Escape;
        }
    };

    const flushOnExit = (context: ISgrParserContext) => {
        context.buffer.flush();
    };

    return new FiniteStateMachine<SgrParserState, ISgrParserContext>({
        start: {
            next: startNext,
        },
        escape: {
            next: context => {
                if (context.charRef.current === CSI_2) {
                    return SgrParserState.Csi;
                }
            },
            onExit: flushOnExit,
        },
        csi: {
            next: context => {
                if (isCharNumeric(context.charRef.current)) {
                    return SgrParserState.SgrAttribute;
                }

                if (context.charRef.current === SGR_END) {
                    return SgrParserState.SgrEnd;
                }
            },
            onExit: flushOnExit,
        },
        sgrAttribute: {
            next: context => {
                if (isCharNumeric(context.charRef.current)) {
                    return SgrParserState.SgrAttribute;
                }

                if (context.charRef.current === SGR_DELIMITER) {
                    return SgrParserState.SgrDelimiter;
                }

                if (context.charRef.current === SGR_END) {
                    return SgrParserState.SgrEnd;
                }
            },
            onExit: context => {
                const value = bufferToNumber(context.buffer.flush());

                context.tokens.push(makeSgrAttributeToken(value));
            },
        },
        sgrDelimiter: {
            next: context => {
                if (isCharNumeric(context.charRef.current)) {
                    return SgrParserState.SgrAttribute;
                }
            },
            onExit: flushOnExit,
        },
        sgrEnd: {
            next: startNext,
            onExit: context => {
                context.buffer.flush();

                const attributes: number[] = [];
                let token: ISgrToken | undefined;

                while ((
                    token = context.tokens[context.tokens.length - 1]
                ) && token.type === SgrTokenType.Attribute) {
                    context.tokens.pop();
                    attributes.unshift(token.value);
                }

                context.tokens.push(makeSgrSelfToken(attributes));
            },
        },
    }, SgrParserState.Start);
};
