import {
    parseCloseTagPos
} from './parseCloseTagPos.js';
import {
    utils
} from './utils.js';

function advance(forTok_ = '', input = '', data = {}) {
    let forTok = forTok_,
        closingTagPos = input.search(forTok) + parseCloseTagPos(input.substring(input.search(forTok))),
        innerHTML = input.substring(input.search(forTok) + forTok.length + 1, closingTagPos),
        arr = forTok.substring(forTok.search("of") + 2, forTok.indexOf('"', forTok.search("of") + 2)).trim(),
        variable = forTok.substring(forTok.search("for=\"") + 5, forTok.search("of")).trim(),
        innerHTML_ = "",
        afterForTok = input.substring(input.search(forTok) + forTok.length);

    if (!data[arr] && utils.mode === 'development') {
        let msg = `${arr} is not defined`;
        let obj = data;
        let tmplt = data.templates.template;
        obj.templates.template = tmplt.substring(0, tmplt.indexOf(arr));
        return utils.logError(msg, utils.parsePosition(data), data.templateUrl);
    } else if (
        !data[arr] && utils.mode !== 'development'
    ) {
        data[arr] = [];
    }

    for (let i = 0; i < data[arr].length; i++) {
        innerHTML_ += innerHTML
            .replaceAll(`{{ ${variable}`, () => {
                return "{{ " + arr + "." + i
            })
    }
    let attrs = afterForTok
        .substring(0, afterForTok.search(">"));

    let oldTag = forTok + ">" + innerHTML;
    let newTag = forTok + ">" + innerHTML_;
    let output = input.replaceAll(oldTag, newTag);
    return output;
}
export function parseFor(input = '', data) {
    let for_REG = new RegExp("<[a-z_0-9]+[ a-z_0-9=\"\';:]+[ ]for=\"[a-z1-9_$]+[ ]+of[ ]+[a-z1-9_$]+[ a-z_0-9=\"\';:]+\"", "g")
    if (for_REG.exec(input) === null) return input;

    let res;
    input.match(for_REG).forEach(forTok => {
        res = advance(forTok, input, data);
        input = res;
        return input;
    })
    return res;
}