import { IToken, ITokenEOF, ITokenCSI, ITokenNewline, ITokenText, TokenType } from './types';

const CSI = '\x1B[';
const SGRm = 'm';
const CRLF = '\r\n';

const makeEOFToken = (): ITokenEOF => {
    return { type: TokenType.EOF };
}

const makeTextToken = (value: string): ITokenText => {
    return { type: TokenType.Text, value };
};

const makeCSIToken = (attrs: string[]): ITokenCSI => {
    return { type: TokenType.CSI, attrs };
};

const makeNewlineToken = (): ITokenNewline => {
    return { type: TokenType.Newline };
};

// TODO(DakEnviy): Change string to Buffer
export const makeAnsiParser = (text: string) => {
    const parse = () => {
        let pos = 0;
        let buf = '';
        let end = 0;

        const read = (n: number) => {
            let m = 0;

            while (n > 0 && pos < end) {
                --n;
                ++pos;
                ++m
            }

            while (n--) {
                const ch = text[pos++];

                if (ch === undefined) {
                    break;
                }

                buf += ch;
                ++end;
                ++m;
            }

            return m;
        };

        const lookup = (n: number) => {
            const prev = pos;
            const m = read(n);
            pos = prev;

            return m;
        };

        const flush = (n: number) => {
            const res = buf.substring(0, n);
            buf = buf.substring(n);
            return res;
        };

        const readWhile = (n: number, pred: () => boolean) => {
            let temp = '';

            while (pred()) {
                const m = read(n);

                if (m === 0) {
                    // TODO(DakEnviy): Make error
                    throw 'Unexpected EOF';
                }

                temp += flush(m);
            }

            buf = temp + buf;

            return temp.length;
        };

        const makePred = (n: number, pred: (m: number) => boolean) => () => {
            return pred(lookup(n));
        };

        const makeEqPred = (seq: string) => {
            return makePred(seq.length, () => buf.startsWith(seq));
        };

        const isEOFToken = makePred(1, m => m === 0);
        const isCSIToken = makeEqPred(CSI);
        const isNewlineToken = makeEqPred(CRLF);
        const isTextToken = () => !isEOFToken() && !isCSIToken() && !isNewlineToken();

        const isSGRm = makeEqPred(SGRm);
        const isNotSGRm = () => !isSGRm();

        const nextEOFToken = () => {
            return makeEOFToken();
        };

        const nextCSIToken = () => {
            read(CSI.length);
            flush(CSI.length);

            const m = readWhile(1, isNotSGRm);
            // TODO(DakEnviy): Replace split
            const attrs = flush(m).split(';');

            read(SGRm.length);
            flush(SGRm.length);

            return makeCSIToken(attrs)
        };

        const nextNewlineToken = () => {
            read(CRLF.length);
            flush(CRLF.length);
            return makeNewlineToken();
        };

        const nextTextToken = () => {
            const m = readWhile(1, isTextToken);
            return makeTextToken(flush(m));
        };

        const nextToken = (): IToken => {
            if (isEOFToken()) {
                return nextEOFToken();
            }

            if (isCSIToken()) {
                return nextCSIToken();
            }

            if (isNewlineToken()) {
                return nextNewlineToken();
            }

            return nextTextToken();
        };

        const tokens: IToken[] = [];
        let cur: IToken;

        do {
            cur = nextToken();
            tokens.push(cur);
        } while (cur.type !== TokenType.EOF);

        return tokens;
    };

    return { parse };
};
