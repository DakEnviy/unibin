import type { IAnsiToken } from '../parser/ansiParser/tokens/types';
import { AnsiTokenType } from '../parser/ansiParser/tokens/constants';
import { HTML_TEMPLATE } from './constants';
import { string } from './utils';

export const makeAnsiHtmlRenderer = function*(title: string) {
    const [templateStart, templateEnd] = HTML_TEMPLATE.split('%content%');

    let isStarted = false;

    while (true) {
        const token: IAnsiToken | undefined = yield;

        if (!token) {
            yield string(templateEnd!);

            return;
        }

        let output = '';

        if (!isStarted) {
            output += templateStart!.replace('%title%', title);
        }

        switch (token.type) {
        case AnsiTokenType.Escape:
            // TODO(DakEnviy): Add support for this one
            break;
        case AnsiTokenType.Newline:
            output += '<br/>';
            break;
        case AnsiTokenType.CarriageReturn:
            // TODO(DakEnviy): Add support for this one
            break;
        case AnsiTokenType.Text:
            output += token.text;
            break;
        }

        yield string(output);

        isStarted = true;
    }
};
