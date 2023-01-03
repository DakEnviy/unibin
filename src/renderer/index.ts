import type { IAnsiToken } from '../parser/ansiParser/tokens/types';

export const makeAnsiHtmlRenderer = function*() {
    while (true) {
        const token: IAnsiToken | undefined = yield;

        if (!token) {
            return;
        }

        yield Buffer.from(`${JSON.stringify(token)}\n`, 'utf-8');
    }
};
