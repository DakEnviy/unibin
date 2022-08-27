import { IAnsiToken } from '../parser/ansiParser/tokens/types';

export const makeAnsiHtmlRenderer = function*() {
    while (true) {
        const token: IAnsiToken | undefined = yield;

        if (!token) {
            // TODO(DakEnviy): Think about it
            return;
        }

        console.log('TOKEN', token);

        yield Buffer.from(`T${token.type.toString()} `, 'utf-8');
    }
};
