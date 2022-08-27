import { FiniteStateMachine } from '../lib/fsm';
import { bufferToNumber, isCharNumeric } from '../lib/utils';
import type { ISgrParserContext } from './types';
import { CSI_2, ESC, SGR_DELIMITER, SGR_END } from './constants';
import { makeSgrAttributeToken, makeSgrSelfToken } from './tokens';
import { SgrTokenType } from './tokens/constants';
import type { ISgrToken } from './tokens/types';
import { EOF } from '../lib/constants';

const startNext = (context: ISgrParserContext) => {
    switch (context.charRef.current) {
    case EOF:
        return 'start';
    case ESC:
        return 'escape';
    }
};

const flushOnExit = (context: ISgrParserContext) => {
    context.buffer.flush();
};

// TODO(DakEnviy): Think about constructor
export const sgrParserMachine = new FiniteStateMachine({
    start: {
        next: startNext,
    },
    escape: {
        next: (context: ISgrParserContext) => {
            if (context.charRef.current === CSI_2) {
                return 'csi';
            }
        },
        onExit: flushOnExit,
    },
    csi: {
        next: (context: ISgrParserContext) => {
            if (isCharNumeric(context.charRef.current)) {
                return 'sgrAttribute';
            }

            if (context.charRef.current === SGR_END) {
                return 'sgrEnd';
            }
        },
        onExit: flushOnExit,
    },
    sgrAttribute: {
        next: (context: ISgrParserContext) => {
            if (isCharNumeric(context.charRef.current)) {
                return 'sgrAttribute';
            }

            if (context.charRef.current === SGR_DELIMITER) {
                return 'sgrDelimiter';
            }

            if (context.charRef.current === SGR_END) {
                return 'sgrEnd';
            }
        },
        onExit: (context: ISgrParserContext) => {
            const value = bufferToNumber(context.buffer.flush());

            context.tokens.push(makeSgrAttributeToken(value));
        },
    },
    sgrDelimiter: {
        next: (context: ISgrParserContext) => {
            if (isCharNumeric(context.charRef.current)) {
                return 'sgrAttribute';
            }
        },
        onExit: flushOnExit,
    },
    sgrEnd: {
        next: startNext,
        onExit: (context: ISgrParserContext) => {
            context.buffer.flush();

            const attributes: number[] = [];
            let token: ISgrToken | undefined;

            while ((token = context.tokens[context.tokens.length - 1]) && token.type === SgrTokenType.Attribute) {
                context.tokens.pop();
                attributes.unshift(token.value);
            }

            context.tokens.push(makeSgrSelfToken(attributes));
        },
    },
}, 'start');
