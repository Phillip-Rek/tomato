import {
    parseCloseTagPos
} from './parseCloseTagPos.js';
import {
    utils
} from './utils.js';
const evaluate = (expressionLexemes, i, operator) => {
    let val1 = expressionLexemes[i - 1];
    let val2 = expressionLexemes[i + 1];
    switch (operator) {
        case "===":
            return val1 === val2 ? true : false;
        case "!==":
            return val1 !== val2 ? true : false;
        case ">":
            return val1 > val2 ? true : false;
        case "<":
            return val1 < val2 ? true : false;
        case ">=":
            return val1 >= val2 ? true : false;
        case "<=":
            return val1 <= val2 ? true : false;
        default:
            return new Error("unexpected token ", operator)
    }
}

const checkConditions = (expressionLexemes, result) => {
    expressionLexemes.forEach((member, i) => {
        if (member === "&&") {
            result = evaluate(expressionLexemes, i - 2, expressionLexemes[i - 2]);
            result = result === true ?
                evaluate(expressionLexemes, i + 2, expressionLexemes[i - 2]) : false;
        } else if (member === "||") {
            result = evaluate(expressionLexemes, i - 2, expressionLexemes[i - 2]);
            result = result === false ?
                evaluate(expressionLexemes, i + 2, expressionLexemes[i - 2]) : true;
        } else if (expressionLexemes.length === 3) {
            result = evaluate(expressionLexemes, 1, expressionLexemes[1])
        }
    })
    return result;
}

const parseExpression = (expression) => {
    let expressionLexemes = expression.trim().split(" ");
    let result;
    result = checkConditions(expressionLexemes, result);
    return result;
}

const parseElse = (input, res) => {
    const ELSE_REG = /<[a-z_0-9]+[ a-z_0-9=\"\';:]+[ ]else[ >]+/;

    if (input.search(ELSE_REG) === -1) {
        return _template_;
    }
    input = input.replaceAll(/\n/g, "").trim();
    const ELSE_OPEN_TAG = ELSE_REG.exec(input)[0].trim();
    const ELSE_TAG_NAME = ELSE_OPEN_TAG.substring(1, ELSE_OPEN_TAG.search(" "));
    const ELSE_POS = input.search(ELSE_OPEN_TAG);
    const ELSE_CLOSE_TAG_POS = ELSE_POS + parseCloseTagPos(input.substring(ELSE_POS));

    /*if (ELSE_POS !== 0) {
        return _template_;
    }*/
    if (res === true) {
        let beforeInput = _template_.substring(0, _template_.search(ELSE_OPEN_TAG))
        let afterInput = _template_
            .substring(
                _template_.search(ELSE_OPEN_TAG) +
                parseCloseTagPos(_template_.substring(_template_.search(ELSE_OPEN_TAG)))
            )
        afterInput = afterInput.substring(afterInput.search(">") + 1).trimLeft()
        _template_ = beforeInput + afterInput;
    }
    return _template_;
}
const parseElseIf = (input, result) => {
    const ELSE_IF_REG = /<[a-z_0-9]+[ a-z_0-9=\"\';:]+[ ]else-if="[a-z0-9_$]+[ ]+[=<>]+[ ]+[a-z0-9_$\"\'{}]+[a-z&0-9><=| ]+"/
    if (input.search(ELSE_IF_REG) === -1) {
        return parseElse(input, result);
    }
    input = input.replaceAll(/\n/g, "").trim()
    const ELSE_IF_OPEN_TAG = ELSE_IF_REG.exec(input)[0].trim();
    const EXPRESSION = ELSE_IF_OPEN_TAG.trim()
        .substring(ELSE_IF_OPEN_TAG.search("\""))
        .replaceAll("\"", "")
    const ELSE_IF_TAG_NAME = ELSE_IF_OPEN_TAG.substring(1, ELSE_IF_OPEN_TAG.search(" "))
    const ELSE_IF_POS = input.search(ELSE_IF_OPEN_TAG)
    const ELSE_IF_CLOSE_TAG_POS = ELSE_IF_POS + parseCloseTagPos(input.substring(ELSE_IF_POS));

    /*if (ELSE_IF_POS !== 0) {
        return parseElse(input, result);
    }*/

    let output = parseExpression(EXPRESSION)

    let
        beforeInput = _template_.substring(0, _template_.search(ELSE_IF_OPEN_TAG)),
        afterInput = _template_
        .substring(
            _template_.search(ELSE_IF_OPEN_TAG) +
            parseCloseTagPos(_template_.substring(_template_.search(ELSE_IF_OPEN_TAG)))
        )
    afterInput = afterInput.substring(afterInput.search(">") + 1);
    let afterElseIf = input.substring(input.indexOf(">", ELSE_IF_CLOSE_TAG_POS) + 1)
    if (result === true) {
        _template_ = beforeInput + afterInput;
        return parseElseIf(afterElseIf, result);
    } else if (output === false) {
        _template_ = beforeInput + afterInput;
        return parseElseIf(afterElseIf, output);
    } else if (output === true) {
        return parseElseIf(afterElseIf, output);
    }

}

let _template_ = '';
const parseIf = (input = '', openTag = '') => {
    if (input.search(openTag) === -1) return input;
    _template_ = input;
    const IF_REG = /<[a-z_0-9]+[ a-z_0-9=\"\';:]+[ ]if="[a-z0-9_${}.]+[ ]+[=<>]+[ ]+[a-z0-9_$\"\'{}.]+[a-z&0-9><={} .]+"/
    const ELSE_IF_REG = /<[a-z_0-9]+[ a-z_0-9=\"\';:]+[ ]else-if="[a-z0-9_$]+[ ]+[=<>]+[ ]+[a-z0-9_$\"\'{}]+[a-z&0-9><=| ]+"/
    const ELSE_REG = /<[a-z_0-9]+[ a-z_0-9=\"\';:]+[ ]else[ >]+/;
    const IF_OPEN_TAG = openTag.trim()
    const EXPRESSION = IF_OPEN_TAG.trim()
        .substring(IF_OPEN_TAG.search("\""))
        .replaceAll("\"", "");
    const IF_POS = input.search(IF_OPEN_TAG)
    const IF_CLOSE_TAG_POS = IF_POS + parseCloseTagPos(input.substring(IF_POS))

    let
        output = parseExpression(EXPRESSION),
        beforeInput = _template_.substring(0, IF_POS),
        afterInput = _template_.substring(IF_CLOSE_TAG_POS)
    afterInput = afterInput.substring(afterInput.search(">") + 1).trimLeft();
    if (output === false) {
        _template_ = beforeInput + afterInput;
    }
    let afterIf = input.substring(input.indexOf(">", IF_CLOSE_TAG_POS) + 1);

    let result = parseElseIf(afterIf, output);
    if (output === true) {
        result = result.replace(IF_OPEN_TAG, (str) => {
            return str.substring(0, str.indexOf(" "))
        })
    }
    return result;
}

export const parseConditionals = (inputTemplate = "", data = {}) => {
    const IF_REG = new RegExp(`<[a-z_0-9]+[ a-z_0-9="';:]+[ ]if="[a-z0-9_{}.$]+[ ]+[=<>!]+[ ]+[a-z0-9_{}$.]+[ a-z&0-9><=! .{}]+"`)
    let RES = inputTemplate;
    while (inputTemplate.match(IF_REG) !== null) {
        RES = RES.replaceAll(/\n/g, " ").trim();
        inputTemplate.match(IF_REG).forEach(elem => {
            return RES = parseIf(RES, elem);
        })
        inputTemplate = RES
    }
    return RES;
}