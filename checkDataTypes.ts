export class CheckDataTypes {
    output: any = null;
    objVal: any;
    constructor(_str: string) {
        if (_str.startsWith('{') && _str.endsWith('}')) {
            this.output = this.createObj(_str);
        }
        else if (_str.startsWith('[') && _str.endsWith(']')) {
            this.output = this.makeArray(_str);
        }
        else if (this.isString(_str)) {
            this.output = this.isString(_str);
        }
        else if (this.isNumber(_str)) {
            this.output = this.isNumber(_str);
        }
        else if (this.isBool(_str) !== null) {
            this.output = this.isBool(_str)
        }
        else if (_str === '') {
            this.output = null;
        }
        else {
            this.output = _str
            /*
            document.write(new Error(`<span class='error'>${_str} is not defined </span>`))
            throw new Error(_str + " is not defined");*/
        }
    }

    isBool = (arg: string): string | boolean => {
        if (arg.trim() === 'true' || arg.trim() === 'false') {
            return arg.trim() === 'true' ? true : false
        }
        return null;
    }

    isNumber = (arg: string): boolean | number => {
        if (parseInt(arg.trim()) === parseInt(arg.trim())) {
            if (arg.indexOf('.') < 0) {
                return parseInt(arg.trim()) // return integer
            } else {
                return parseFloat(arg.trim()) // return float
            }
        }
        else {
            return false;
        }
    }

    isString = (arg: string): string | boolean => {
        if ((arg.startsWith('"') && arg.endsWith('"')) ||
            (arg.startsWith("'") && arg.endsWith("'"))
        ) {
            return arg.trim().substring(1, arg.length - 1);
        }
        return false;
    }

    /* creating an object from a string 
    e.g str = {name: 'phillip', lastname: 'rekhotho'} */
    createObj = (str: string | any) => {
        let obj: any = {};
        let preObj = str.substring(1, str.length - 1).replaceAll(": {", ":{");

        //check if there are any nested objects
        if (preObj.indexOf('{') !== -1 && preObj.indexOf('}') !== -1) {
            let nestedObj = preObj.substring(preObj.search(":{"));

            let mainObj = preObj.substring(0, preObj.indexOf(":{"));

            mainObj.split(",").forEach((item: any) => {
                let itemKey = item.split(":")[0]
                let itemVal = item.split(":")[1]

                if (itemVal) {
                    obj[itemKey] = itemVal.replaceAll("'", '').trim();
                }
                else {
                    obj[itemKey] = this.createObj(nestedObj.replace(":", "").trim());
                }

            })
        }
        else {
            preObj.split(',').forEach((item: any) => {
                let OBJcomponents = item.replaceAll("}", "").trim().split(':');

                if (OBJcomponents[1] === undefined) {
                    this.objVal = OBJcomponents[0].trim()
                }
                else {
                    this.objVal = OBJcomponents[1].trim();
                }

                if (this.isString(this.objVal)) {
                    obj[OBJcomponents[0]] = this.isString(this.objVal);
                }
                else if (this.isNumber(this.objVal)) {
                    obj[OBJcomponents[0]] = this.isNumber(this.objVal);
                }
                else if (this.objVal) {
                    obj[OBJcomponents[0]] = this.objVal;
                }
                else {
                    document.write(
                        //new Error(`<span class='error'>${this.objVal} is not defined </span>`)
                    )
                    throw new Error(this.objVal + ' is not defined')
                }
            })
        }

        return obj
    }

    /*creating an Array from a string e.g
    let str = "[1, 2, 3, 4, 5]"*/
    makeArray = (_str: any = ''): any[] => {
        let arr = [];
        let _arr = _str.substring(1, _str.length - 1).trim();

        if (_arr.indexOf('[') !== -1 &&
            _arr.indexOf(']') !== -1 &&
            _arr.indexOf('{') !== -1 &&
            _arr.indexOf('}') !== -1
        ) {
            _arr = _arr.replaceAll(" ", '')
                .replaceAll("},[", "},{")
                .replaceAll("],{", "},{")
                .replaceAll("]", "}")
                .replaceAll("[", "{")
                .slice(1, -1);
            _arr = _arr.split("},{")

            _arr.forEach((arrayMember: any) => {
                if (arrayMember.indexOf(":") !== -1) {
                    arr.push(this.createObj("{" + arrayMember + "}"))
                }
                else {
                    arr.push(this.makeArray("[" + arrayMember + "]"))
                }
            })
        }
        else if (_arr.indexOf('[') !== -1 && _arr.indexOf(']') > -1) {
            //Nested Arrays
            let mainArr = _arr.substring(0, _arr.indexOf("["));
            mainArr = mainArr.substring(0, mainArr.length - 1);
            let nestedArr = _arr.substring(_arr.indexOf("["));

            mainArr.split(',').forEach((item: any) => {
                item = item.trim()
                if (this.isString(item)) {
                    return arr.push(this.isString(item));
                }
                else if (this.isNumber(item)) {
                    return arr.push(this.isNumber(item));
                }
                else {
                    //document.write(new Error(`<span class='error'>${item} is not defined </span>`))
                    throw new Error(item + ' is not defined')
                }
            });

            arr.push(this.makeArray(nestedArr))
        }
        else if (_arr.indexOf('{') !== -1 && _arr.indexOf('}') !== -1) {
            // Array consisting of Objects
            _arr = _arr.slice(1, -1)
            _arr.split("},{").forEach((item: any) => {
                item = arr.push(this.createObj("{" + item + "}"));
            })
        }
        else {
            _arr.split(',').forEach((item: any) => {
                item = item.trim()
                if (this.isString(item)) {
                    return arr.push(this.isString(item));
                }
                else if (this.isNumber(item)) {
                    return arr.push(this.isNumber(item));
                }
                else {
                    //return arr.push(this.createObj)
                    //document.write(new Error(`<span class='error'>${item} is not defined </span>`))
                    throw new Error(item + ' is not defined')
                }
            });
        }

        return arr
    }
}
