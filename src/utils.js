export const utils = {};
utils.mode = "production"

utils.parsePosition = (data) => {
    let pos = {};
    let tmplt = data.templates.template;
    pos.row =
        tmplt.match(/([\n])/g) !== null &&
        tmplt.match(/([\n])/g).length + 1 || 1;
    pos.col = tmplt.substring(tmplt.lastIndexOf(`\n`) + 1).length;
    return pos;
}
utils.logError = (msg, pos, srcFile) => {
    throw new Error(`${msg} in ${srcFile} row: ${pos.row} column: ${pos.col}`)

}
utils.warn = (msg, pos, srcFile) => {
    console.warn(`${msg} in ${srcFile} row: ${pos.row} column: ${pos.col}`)
}