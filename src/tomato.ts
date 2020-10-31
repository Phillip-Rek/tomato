import { CheckDataTypes } from './checkDataTypes';
import { ConditionalRender } from './conditionalRender';
import { Router, Route } from './router';

export class TomatoComponent {
    templateUrl?: string;
    styleUrl?: string;
    templateTag?: string;
    template?: string;
    children?: Array<TomatoComponent> | Array<any> = []
}
const handleRouting = async (routes: Route[]) => {
    if (routes !== undefined) {
        new Router(routes)
    }
}
// Entry point to a tomato application
export class Tomato {
    constructor(components: Array<(() => void) | any>, routes?: Array<Route>) {
        handleRouting(routes).then(() => {
            for (let i = 0; i < components.length; i++) {
                const component_: any | (() => void) = components[i];
                let components_: Array<(() => void) | any> = [];
                let component: TomatoComponent = constructComponent(component_);
                getTemplate(
                    component,
                    (comp: TomatoComponent, template: string) => {
                        let elements = Array.from(document.querySelectorAll(comp.templateTag))
                        if (elements.length !== 0) {
                            addTemplateToTheDOM(template, comp, component_);
                            if (component.children !== undefined) {
                                component.children.forEach(child => {
                                    components_.push(child)
                                })
                            }
                        }
                        else {
                            components_.push(component_)
                        }
                        new Tomato(components_, routes);
                    }
                );
            }
        })
    }
}
const constructComponent = (component_: any): TomatoComponent => {
    class Component extends component_ {
        constructor() {
            super()
        }
    }
    return new Component();
}

const getTemplate = (
    component: any,
    cb: (arg: any, arg2: string) => void
) => {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            let template: any = xhttp.responseText;
            /**adding event attributes to all elements
             * containing p-on[evname] directive,
             * eg if p-onclick=func1(arg),
             * adding double curly braces on the parameter
             * in order for a tokenizer to understand
             */
            template = template.replaceALl(/(?:p-on(.+?)=(.+?)[(](.+?)[)])/g,
                (arg: any) => "event " + arg.replace("(", "({{").substring(0, arg.length + 1) + "}})")
                .replaceAll(/(?:p-on(.+?))/, (arg: any) => 'event ' + arg);
            cb(component, template)
        }
    };
    xhttp.open("GET", component.templateUrl, true);
    xhttp.send();
}

const addTemplateToTheDOM = (
    template: string,
    controller: TomatoComponent,
    componentConstructor: () => void
) => {
    let tags = controller.templateTag;
    Array.from(document.getElementsByTagName(tags))
        .forEach((tag: HTMLElement) => {
            controller = passPropsToChild(controller, tag);
            tag.innerHTML = replaceTokens(controller, template);
            //handleEvents(controller, tags);
            looping(componentConstructor, controller, tags, () => {
                conditionalRendering(tag.innerHTML, '', controller, tags);
            });
        })
}

const passPropsToChild = (
    controller: TomatoComponent | any,
    tag: HTMLElement | Element
): TomatoComponent => {
    Array.from(tag.attributes).forEach((attribute: Attr) => {
        controller[attribute.name] = attribute.value;
    });
    return controller;
}

const handleEvents = (
    componentConstructor: () => void,
    controller: TomatoComponent | any,
    templateTag: string
) => {
    Array.from(document.querySelectorAll("[event]")).forEach((elem: HTMLElement) => {
        Array.from(elem.attributes).forEach(evName => {
            if (evName.name.substring(0, 4) === 'p-on') {
                let handlerFunc: any = evName.value.split('(')[0];
                let params: any = evName.value.split('(')[1].split(')')[0];
                params = new CheckDataTypes(params).output
                if (bindToController(elem, templateTag) !== true) return;

                if (controller[handlerFunc]) {
                    elem.addEventListener(evName.name.substring(4), (e) => {
                        controller[handlerFunc](params);
                        let routes = controller.routes;
                        new Tomato([componentConstructor], routes);
                    });
                }
                else if (window[handlerFunc]) {
                    elem.addEventListener(evName.name.substring(4), (e) => {
                        handlerFunc = window[handlerFunc]
                        handlerFunc(params);
                    })
                }
                else if (handlerFunc.split(".")['0'] === 'console') {
                    Object.entries(console).map(func => {
                        if (func[0] === handlerFunc) {
                            elem.addEventListener(evName.name.substring(4), (e) => {
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

const conditionalRendering = (
    template: string,
    templateUrl: string,
    controller: any = {},
    templateTag: string
): ConditionalRender => {
    return new ConditionalRender();
}


const looping = (
    componentConstructor: () => void,
    data: any,
    tag: string,
    conditionalRender: () => void
) => {
    let loopEL = document.querySelectorAll("[p-for]");

    if (loopEL.length === 0) return;

    Array.from(loopEL).forEach((el: HTMLElement | any) => {
        let loopStatement: string[] =
            (el.attributes['p-for']).nodeValue.split(' ')
                .filter((el: any) => el !== "");
        let updatedTxt: string = "";
        if (data[loopStatement[1]] === undefined || !bindToController(el, tag))
            return null;
        data[loopStatement[1]].map((item: any) => {
            let obj: any = {}
            obj[loopStatement[0]] = item;
            updatedTxt = updatedTxt + replaceTokens(obj, el.innerHTML.trim());
        });
        el.innerHTML = updatedTxt;
        el.removeAttribute('p-for');
    })
    conditionalRender();
    handleEvents(componentConstructor, data, tag);
}

const replaceTokens = (
    data: any = {},
    innerText: string
) => {
    innerText = innerText.replace(/(?:{{(.+?)}})/g, (token) => {
        if (token.slice(2, -2).indexOf('.') !== -1) {
            let arr: string[] = token.slice(2, -2).split('.');
            let dataObj: any = data;
            for (let i = 0; i < arr.length; i++) {
                if (dataObj === undefined) return token;
                dataObj = dataObj[arr[i].trim()];
            }
            if (dataObj === undefined) {
                return token
            } else if (dataObj.constructor.name === "Object") {
                dataObj = objectToStr(dataObj)
            } else if (dataObj.constructor.name === "Array") {
                dataObj = ArrayToStr(dataObj)
            } else {
                dataObj = dataObj;
            }
            return dataObj;
        }
        else if (token.slice(2, -2).indexOf("[") !== -1 &&
            token.slice(2, -2).indexOf("]") > -1) {
            return nestedArrayToStr(data, token); //nested arrays
        }
        else if (data[token.slice(2, -2)] === undefined) {
            return token; //print error message
        }
        else if (data[token.slice(2, -2)].constructor.name === 'Object') {
            return objectToStr(data[token.slice(2, -2)]);
        }
        else if (data[token.slice(2, -2)].constructor.name === 'Array') {
            return ArrayToStr(data[token.slice(2, -2)]);
        }
        else if (data[token.slice(2, -2)] !== undefined) {
            return data[token.slice(2, -2)]
        }
    });
    return innerText;
};


const nestedArrayToStr = (
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
    return ArrayToStr(data[token][arrayIndex]);
}

//convert an object to a string
const objectToStr = (arg: object = {}): string => {
    let str: string = "{";
    Object.entries(arg).forEach((keyVal) => {
        if (keyVal[1].constructor.name === 'Object') {
            str = str + keyVal[0] + ":" + objectToStr(keyVal[1]) + ",";
        } else if (keyVal[1].constructor.name === "Array") {
            str = str + keyVal[0] + ':' + ArrayToStr(keyVal[1]) + ",";
        } else {
            str = str + keyVal[0] + ":'" + keyVal[1] + "',";
        }
    })
    str = str.substring(0, str.length - 1) + "}";

    return str;
}

const ArrayToStr = (arg: any[] = []) => {
    let str = "[";

    arg.forEach((item: any) => {
        if (item.constructor.name === 'Object') {
            str = str + objectToStr(item) + ',';
        } else if (item.constructor.name === 'Array') {
            str = str + ArrayToStr(item) + ',';
        } else {
            str = str + item + ',';
        }
    })

    str = str.substring(0, str.length - 1) + "]";

    return str;
}
