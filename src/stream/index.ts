import { makeAnsiHtmlRenderer } from '../renderer';
import { makeAnsiBufferParser } from '../parser/ansiParser';
import type { IAnsiToken } from '../parser/ansiParser/tokens/types';

export const makeTermFileStream = function*() {
    const parser = makeAnsiBufferParser();
    const renderer = makeAnsiHtmlRenderer();

    let token: IAnsiToken | undefined = undefined;
    let part: Uint8Array | undefined = undefined;

    let isOutput = true;

    while (true) {
        if (isOutput) {
            const result = renderer.next(token);

            if (result.done) {
                break;
            }

            if (result.value) {
                yield result.value;
            } else {
                isOutput = false;
            }
        } else {
            const result = parser.next(part);

            if (result.done) {
                token = undefined;
                isOutput = true;

                continue;
            }

            if (result.value) {
                token = result.value;
                isOutput = true;
            } else {
                part = yield;
            }
        }
    }
};
