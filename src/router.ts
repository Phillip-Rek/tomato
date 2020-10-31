import { TomatoComponent } from './library2';

export interface Route {
    path: String;
    controller: TomatoComponent | any;
}
export class Router {
    private controller: TomatoComponent | any;

    constructor(routes: Route[]) {
        this.controller = this.getComponentOfCurrentPath(routes)
        this.renderComponent(this.controller)
    }
    private getComponentOfCurrentPath(routes: Route[]) {
        let url = window.location.href;
        let path = url.substring(url.indexOf("#") + 1);
        for (let i = 0; i < routes.length; i++) {
            const route: Route = routes[i];
            if (path === route.path) {
                return route.controller;
            }
        }
    }

    //a tag named routerOutlet will be removed in production
    private renderComponent(controller: TomatoComponent | any) {
        let outlet = Array.from(document.querySelectorAll("routeroutlet"))[0]

        if (outlet !== undefined &&
            Array.from(outlet.children).length === 0 &&
            controller !== undefined
        ) {
            let controller_ = new controller();
            let tag = controller_.templateTag;
            let componentEl = document.createElement(tag);
            outlet.appendChild(componentEl);
        };
    }
}
