import { FiniteStateMachine } from '../lib/fsm';
import { bufferToNumber, isCharNumeric } from '../lib/utils';
import type { IEscapeParserContext } from './types';
import {
    CHA,
    CNL,
    CPL,
    CSI,
    CUB,
    CUD,
    CUF,
    CUP,
    CUU,
    DELIMITER,
    ED,
    EL,
    ENC,
    ENC_DEFAULT,
    ENC_UTF8,
    ESC,
    EscapeParserState,
    HVP,
    RI,
    SD,
    SGR,
    SU,
} from './constants';
import { makeEscapeParameterToken, makeEscapeSgrToken } from './tokens';
import { EscapeTokenType } from './tokens/constants';
import type { IEscapeToken } from './tokens/types';
import { EOF } from '../lib/constants';

export const makeEscapeParserMachine = () => {
    const startNext = (context: IEscapeParserContext) => {
        switch (context.charRef.current) {
        case EOF:
            return EscapeParserState.Start;
        case ESC:
            return EscapeParserState.Escape;
        }
    };

    const csiNext = (context: IEscapeParserContext) => {
        if (isCharNumeric(context.charRef.current)) {
            return EscapeParserState.Parameter;
        }

        switch (context.charRef.current) {
        case DELIMITER:
            return EscapeParserState.Delimiter;
        case CUU:
            return EscapeParserState.Cuu;
        case CUD:
            return EscapeParserState.Cud;
        case CUF:
            return EscapeParserState.Cuf;
        case CUB:
            return EscapeParserState.Cub;
        case CNL:
            return EscapeParserState.Cnl;
        case CPL:
            return EscapeParserState.Cpl;
        case CHA:
            return EscapeParserState.Cha;
        case CUP:
            return EscapeParserState.Cup;
        case ED:
            return EscapeParserState.Ed;
        case EL:
            return EscapeParserState.El;
        case SU:
            return EscapeParserState.Su;
        case SD:
            return EscapeParserState.Sd;
        case HVP:
            return EscapeParserState.Hvp;
        case SGR:
            return EscapeParserState.Sgr;
        }
    };

    const flush = (context: IEscapeParserContext) => {
        context.buffer.flush();
    };

    const extractParameters = (tokens: IEscapeToken[]) => {
        const parameters: number[] = [];

        let token: IEscapeToken | undefined;

        while ((token = tokens[tokens.length - 1]) && token.type === EscapeTokenType.Parameter) {
            tokens.pop();
            parameters.unshift(token.value);
        }

        return parameters;
    };

    const flushWithParameters = (context: IEscapeParserContext) => {
        context.buffer.flush();
        extractParameters(context.tokens);
    };

    const pushParameterIfNeeded = (context: IEscapeParserContext, from: EscapeParserState) => {
        if (from !== EscapeParserState.Parameter) {
            context.tokens.push(makeEscapeParameterToken());
        }
    };

    const ignoreSequence = {
        next: startNext,
        onExit: flushWithParameters,
    };

    // TODO(DakEnviy): Make unknown escape token
    return new FiniteStateMachine<EscapeParserState, IEscapeParserContext>({
        start: {
            next: startNext,
        },
        escape: {
            next: context => {
                switch (context.charRef.current) {
                case CSI:
                    return EscapeParserState.Csi;
                case RI:
                    return EscapeParserState.Ri;
                case ENC:
                    return EscapeParserState.Enc;
                }
            },
            onExit: flush,
        },
        parameter: {
            next: csiNext,
            onExit: context => {
                const value = bufferToNumber(context.buffer.flush());

                context.tokens.push(makeEscapeParameterToken(value));
            },
        },
        delimiter: {
            next: csiNext,
            onJoin: pushParameterIfNeeded,
            onExit: flush,
        },
        csi: {
            next: csiNext,
            onExit: flush,
        },
        cuu: ignoreSequence,
        cud: ignoreSequence,
        cuf: ignoreSequence,
        cub: ignoreSequence,
        cnl: ignoreSequence,
        cpl: ignoreSequence,
        cha: ignoreSequence,
        cup: ignoreSequence,
        ed: ignoreSequence,
        el: ignoreSequence,
        sd: ignoreSequence,
        su: ignoreSequence,
        hvp: ignoreSequence,
        sgr: {
            next: startNext,
            onJoin: pushParameterIfNeeded,
            onExit: context => {
                context.buffer.flush();

                const attributes = extractParameters(context.tokens);

                context.tokens.push(makeEscapeSgrToken(attributes));
            },
        },
        ri: ignoreSequence,
        enc: {
            next: context => {
                switch (context.charRef.current) {
                case ENC_DEFAULT:
                case ENC_UTF8:
                    return EscapeParserState.EncValue;
                }
            },
        },
        encValue: {
            next: startNext,
            // Ignore encoding sequence
            onExit: flush,
        },
    }, EscapeParserState.Start);
};

const endStateKeys = new Set([
    EscapeParserState.Cuu,
    EscapeParserState.Cud,
    EscapeParserState.Cuf,
    EscapeParserState.Cub,
    EscapeParserState.Cnl,
    EscapeParserState.Cpl,
    EscapeParserState.Cha,
    EscapeParserState.Cup,
    EscapeParserState.Ed,
    EscapeParserState.El,
    EscapeParserState.Su,
    EscapeParserState.Sd,
    EscapeParserState.Hvp,
    EscapeParserState.Sgr,
    EscapeParserState.Ri,
    EscapeParserState.EncValue,
]);

export const isEndEscapeStateKey = (stateKey: EscapeParserState) => {
    return endStateKeys.has(stateKey);
};
