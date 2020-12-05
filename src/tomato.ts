import { CheckDataTypes } from './checkDataTypes';
import { Router, Route } from './router';
import { parseFor } from './forParser.js';
import { parseConditionals } from './conditionsParser.js';
import { utils } from './utils.js';

export class TomatoComponent {
    templateUrl?: string;
    styleUrl?: string;
    templates: {
        template?: string;
        parsedTemplate: string;
    }
    templateTag?: string;
    children?: Array<TomatoComponent> | Array<any> = [];
    onMount?: () => void;
}
declare interface Position {
    col: string;
    row: string;
}


const handleRouting = (routes: Route[]): any => {
    if (routes !== undefined) {
        return new Router(routes)
    }
}
// Entry point to a tomato application
export class Tomato {
    constructor(components: Array<TomatoComponent | Function>, routes?: Array<Route>) {
        handleRouting(routes)
        for (let i = 0; i < components.length; i++) {
            const component_: TomatoComponent | Function = components[i];
            let components_: Array<(TomatoComponent | Function)> = [];
            const component: TomatoComponent = constructComponent(component_);
            getTemplate(
                component,
                (comp: TomatoComponent, template: string) => {
                    if (typeof component_ === 'function') {
                        component_.prototype.templates = {};
                        component_.prototype.templates.template = template;
                    }
                    else {
                        component_.templates.template = template;
                    }
                    renderTemplate(template, comp, component_);
                    components_ = getChildComponents(component, components_)
                    new Tomato(components_, routes);
                }
            );
        }
    }
}
function getChildComponents(
    component: TomatoComponent,
    components_: Array<(TomatoComponent | Function)>
): Array<(TomatoComponent | Function)> {
    if (component.children !== undefined) {
        component.children.forEach((child: any) => {
            components_.push(child)
        })
    }
    return components_;
}
const constructComponent = (component_: any): TomatoComponent => {
    return typeof component_ === 'function' ?
        new component_() : component_;
}

const getTemplate = (
    component: any,
    cb: (arg: any, arg2: string) => void
) => {
    if (component.templates !== undefined) {
        component.templates.parsedTemplate = parseFor(component.templates.template, component);
        return cb(component, component.templates.template)
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            let template: any = xhttp.responseText;
            template = template
                .replace(
                    /(?:(\*)(on)(.+?)[=](.+?)[(])/g,
                    (arg: any) => 'event ' + arg
                );
            component.templates = {}
            component.templates.template = template;
            cb(component, template);
        }
    };
    xhttp.open("GET", component.templateUrl, true);
    xhttp.send();
}
const validateFilterFunction = (funcName: string, filterFunc: string, data: any): void => {
    let doesHasReturnStatement = filterFunc.toString().search(" return ");
    if (doesHasReturnStatement === -1) {
        let errMsg = `${funcName} has no return statement ` +
            `and filters need to have a return statement`;
        let tmplt = data.templates.template;
        let object = {
            templates: {
                template: ''
            }
        };
        object.templates.template = tmplt.substring(0, tmplt.indexOf(funcName));
        utils.logError(errMsg, utils.parsePosition(data), data.templateUrl);
    }
}
const parseFilters = (data: any, template: string) => {
    let filters_Re = /{{[ ][a-z0-9_]+\([a-z0-9_."']+\)[ ]}}/g;
    let filters = template.match(filters_Re);
    if (filters === null) return template;
    filters.forEach((filter) => {
        filter = filter.slice(2, -2).trim();
        let paramStart = filter.indexOf("(");
        let _function = filter.substring(0, paramStart);
        validateFilterFunction(_function, data[_function], data)
        let param = filter.substring(paramStart);
        param = param.replace("(", "{{").replace(")", "}}");
        param = replaceTokens(data, param);
        let output = data[_function](param);
        template = template.replace(`{{ ${filter} }}`, output)
        return output;
    })
    return template;
}
const renderTemplate = (
    template: string,
    controller: TomatoComponent | Function | any,
    componentConstructor: TomatoComponent | Function
): void => {
    let tagName: string = getTagName(controller),
        templatetags = Array.from(document.getElementsByTagName(tagName))
    controller = resetLifeCycle(templatetags, controller)
    template = parseFor(template, controller);
    template = parseConditionals(template, controller);
    template = parseFilters(controller, template)
    template = replaceTokens(controller, template)
    controller.templates.parsedTemplate = template;
    for (let i = 0; i < templatetags.length; i++) {
        const tag = templatetags[i];
        controller = passPropsToChild(controller, tag);
        tag.innerHTML = replaceTokens(controller, template);
        handleEvents(componentConstructor, controller, tagName, template);
        initComponentLifecycle(controller);
    }
}
const getTagName = (controller: TomatoComponent | Function
): string => {
    if (
        typeof controller === 'function' ||
        controller.constructor.name !== 'undefined'
    )
        return controller.constructor.name.toLowerCase();
    else
        return controller.templateTag;
}
const resetLifeCycle = (
    templatetags: Array<Element>,
    controller: TomatoComponent | Function | any
) => {
    if (templatetags.length > 0) {
        if (templatetags[0].innerHTML === "") {
            controller.lifeCycle = "mounted"
        }
        else
            controller.lifeCycle = "updated"
    }
    return controller;
}

const initComponentLifecycle = (controller: any) => {
    if (
        controller["onMount"] !== undefined &&
        controller.lifeCycle === "mounted"
    ) {
        controller["onMount"]();
    }
    else if (
        controller["onUpdate"] !== undefined &&
        controller.lifeCycle === "updated"
    ) {
        controller["onUpdate"]();
    }
}
const dataBinding = (controller: any) => {
    let modelEls = document.querySelectorAll("[p-model]")

    modelEls.forEach((modelEl: HTMLInputElement) => {
        let modelKeyHolder = modelEl.getAttribute("p-model");
        let bindingEl = document.querySelectorAll(`[${modelKeyHolder}]`)[0]
        let token = `{{${modelKeyHolder}}}`;
        const innerText = bindingEl.innerHTML;
        modelEl.addEventListener("keyup", (e: any) => {
            bindingEl.innerHTML = innerText.replace(token, e.target.value)
        })

        if (typeof controller === 'function') {
            controller['prototype'][modelKeyHolder] = modelEl.value;
        }
        bindingEl.removeAttribute(modelKeyHolder)
        bindingEl.removeAttribute("p-bind")
        modelEl.removeAttribute("p-model")
    })
    return controller;
}
const passPropsToChild = (
    controller: (TomatoComponent | Function),
    tag: (HTMLElement | Element)
): (TomatoComponent | Function) => {
    Array.from(tag.attributes).forEach((attribute: Attr) => {
        let value: string = attribute.value;
        Object.defineProperty(
            controller,
            attribute.name,
            { value }
        )
    });
    return controller;
}

const handleEvents = (
    componentConstructor: ((() => void) | any),
    controller: (TomatoComponent | Function | any),
    templateTag: string,
    template: string
) => {
    Array.from(document.querySelectorAll("[event]")).forEach((elem: HTMLElement) => {
        Array.from(elem.attributes).forEach(evName => {
            if (evName.name.substring(0, 3) === '*on') {
                let handlerFunc: any = evName.value.split('(')[0];
                let params: any = evName.value.split('(')[1].split(')')[0];
                params = new CheckDataTypes(params).output;
                let eventType = evName.name.substring(3);

                if (bindToController(elem, templateTag) !== true) return;

                if (controller[handlerFunc]) {
                    elem.addEventListener(eventType, (e: Event) => {
                        e.preventDefault();
                        e.stopPropagation();
                        let oldDom = replaceTokens(controller, controller.templates.parsedTemplate)
                        controller[handlerFunc](params);
                        let newDom = replaceTokens(controller, controller.templates.parsedTemplate)
                        componentConstructor = dataBinding(componentConstructor);
                        let routes = controller.routes;
                        if (typeof componentConstructor === 'function') {
                            componentConstructor.prototype.lifecycle = "update";
                        }
                        else {
                            componentConstructor.lifecycle = "update";
                        }
                        new Tomato([componentConstructor], routes);
                    });
                }
                else if (window[handlerFunc]) {
                    elem.addEventListener(eventType, (e) => {
                        handlerFunc = window[handlerFunc];
                        handlerFunc(params);
                    })
                }
                else if (handlerFunc.split(".")['0'] === 'console') {
                    Object.entries(console).map(func => {
                        if (func[0] === handlerFunc) {
                            elem.addEventListener(eventType, (e) => {
                                func[1](params)
                            })
                        }
                    })
                }
                else {
                    throw new Error(`${handlerFunc} is not defined`)
                }
            }
            elem.removeAttribute(evName.name)
        })
        elem.removeAttribute("event")
    })
}
const bindToController = (
    elem: HTMLElement,
    templateTag: string
): boolean => {
    let parentEl = elem.parentElement;
    while (
        parentEl.localName !== 'body' &&
        parentEl.localName !== templateTag
    ) {
        parentEl = parentEl.parentElement;
    }
    return parentEl.localName === templateTag ? true : false;
}
const raiseTokenUndef = (data: any, token: string) => {
    if (utils.mode === 'development') {
        let errMsg = `${token} is not defined`
        let obj = data;
        let tmplt = data.templates.template;
        obj.templates.template = tmplt.substring(0, tmplt.indexOf(token));
        utils.logError(errMsg, utils.parsePosition(obj), data.templateUrl)
        return ''
    }
    else {
        return '';
    }
}
const replaceTokens = (
    data: any = {},
    innerText: string
) => {
    if (innerText === undefined) return innerText;
    innerText = innerText.replace(/(?:{{(.+?)}})/g, (token: string) => {
        let _token = token.slice(2, -2)
            .replace(" ", '')
            .replace(" ", '');

        if (_token.indexOf('.') !== -1) {
            let arr: string[] = _token.split('.');
            let dataObj: any = data;
            for (let i = 0; i < arr.length; i++) {
                if (dataObj === undefined) {
                    return raiseTokenUndef(data, token);
                }
                dataObj = dataObj[arr[i].trim()];
            }
            if (dataObj === undefined) {
                dataObj = raiseTokenUndef(data, token);
            }
            else if (dataObj.constructor.name === "Object") {
                dataObj = objectToStr(dataObj)
            }
            else if (dataObj.constructor.name === "Array") {
                dataObj = arrayToStr(dataObj)
            }
            else {
                dataObj = dataObj;
            }
            return dataObj;
        }
        else if (_token.indexOf("[") !== -1 &&
            _token.indexOf("]") > -1) {
            return nestedarrayToStr(data, token); //nested arrays
        }
        else if (data[_token] === undefined) {
            return raiseTokenUndef(data, token); //print error message
        }
        else if (data[_token].constructor.name === 'Object') {
            return objectToStr(data[_token]);
        }
        else if (data[_token].constructor.name === 'Array') {
            return arrayToStr(data[_token]);
        }
        else {
            return data[_token]
        }
    });
    return innerText;
};
const nestedarrayToStr = (
    data: any,
    token: string
) => {
    //in this case a token is an Array name
    let arrayIndex = parseInt(token.slice(2, -2)
        .substring(token.indexOf("[") - 2).slice(1, -1));
    token = token.slice(2, -2).substring(0, token.indexOf("[") - 2);
    if (data[token][arrayIndex].constructor.name === "Object") {
        return objectToStr(data[token][arrayIndex]);
    }
    return arrayToStr(data[token][arrayIndex]);
}

//convert an object to a string
const objectToStr = (arg: object = {}): string => {
    let str: string = "{";
    Object.entries(arg).forEach((keyVal) => {
        if (keyVal[1].constructor.name === 'Object') {
            str = str + keyVal[0] + ":" + objectToStr(keyVal[1]) + ",";
        } else if (keyVal[1].constructor.name === "Array") {
            str = str + keyVal[0] + ':' + arrayToStr(keyVal[1]) + ",";
        } else {
            str = str + keyVal[0] + ":'" + keyVal[1] + "',";
        }
    })
    str = str.substring(0, str.length - 1) + "}";
    return str;
}

const arrayToStr = (arg: any[] = []) => {
    let str = "[";

    arg.forEach((item: any) => {
        if (item.constructor.name === 'Object') {
            str = str + objectToStr(item) + ',';
        } else if (item.constructor.name === 'Array') {
            str = str + arrayToStr(item) + ',';
        } else {
            str = str + item + ',';
        }
    })

    str = str.substring(0, str.length - 1) + "]";

    return str;
}