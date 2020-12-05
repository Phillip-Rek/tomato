let unclosedTags = [];
let template = "";
const handleOpenTag = (i) => {
    let tagName = "";
    for (let i_ = i + 1; i_ < template.length; i_++) {
        const char = template[i_];
        if (char === ">" || char === "/") {
            break;
        } else if (char === " ") {
            let attributes = '';
            break;
        } else
            tagName += char;
    }
    unclosedTags.push(tagName)
    return {
        tokenType: "openTag",
        tagName,
        position: i,
    }
}
const handleclosingTag = (i_) => {
    let tagName = "";
    for (let i = i_ + 2; i < template.length; i++) {
        const char = template[i];
        if (char === ">") break;
        tagName += char
    }
    if (unclosedTags.length === 0) {
        let errMsg = `</${tagName}> has no corresponding opening tag
        at position: ${i_}`
        throw new Error(errMsg)
    }

    if (unclosedTags[unclosedTags.length - 1] === tagName)
        unclosedTags.pop()

    return {
        tokenType: "closeTag",
        tagName,
        position: i_
    }
}
const handleSelfClosingTag = () => {
    unclosedTags.pop()
}
const isClosingTag = (i) => {
    return template[i] + template[i + 1] !== "</" ? false : true
}
const isOpenTag = (i) => {
    let char = template[i];
    let nxtChar = template[i + 1];
    return char === "<" &&
        nxtChar !== " " &&
        nxtChar !== "=";
}
const isSelfClosingTag = (i) => {
    return template[i] + template[i + 1] !== "/>" ? false : true
}

export const parseCloseTagPos = (template_) => {
    template = template_;
    for (let i = 0; i < template.length; i++) {
        const char = template[i];
        if (isClosingTag(i)) {
            handleclosingTag(i)
        } else if (isOpenTag(i)) {
            handleOpenTag(i)
        } else if (isSelfClosingTag(i)) {
            handleSelfClosingTag()
        } else if (template.substring(i).trim() === "") {
            break
        }
        if (unclosedTags.length === 0) {
            return i;
        }
    }
}