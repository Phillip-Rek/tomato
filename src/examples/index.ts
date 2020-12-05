import { Tomato, TomatoComponent } from '../tomato';
import { Comp2 } from './comp2';
import { USERS, removeUser_ } from './store';
import { routes } from './router';
import { changeRoute } from '../router';

export class App {
    templateUrl = 'src/index.html';
    children: any = [Comp2];
    routes = routes;
    nums = [1, 2, 3, 4, 5]
    users = USERS;
    //users: any[] = []
    m: any;
    removeUser = (username: string) => {
        this.users = this.users.filter(user => user.name !== username)
        removeUser_(username)
    }
    capitalise = (arg: string) => {
        return arg.toUpperCase();
    }
    test = () => {
        if (window.location.href === "http://127.0.0.1:5500/#/a2")
            changeRoute('', '', '/a')
        else
            changeRoute('', '', '/a2')
    }
    newUser: string = "jk";

    setUser() {
        this.newUser = Array.from(document.querySelectorAll("input"))[0].value
    }

    addUser() {
        USERS.push({
            name: "new user",
            lastname: 'new lastname'
        })

        new Tomato([App], routes)
    }

    writeMethod(a: any) {
        console.log(a)
    }

    onMount() {

    }
}
const render = (Comp: any) => {
    new Tomato([Comp], routes)
}
render(App)