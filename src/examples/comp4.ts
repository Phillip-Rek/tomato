import { Tomato } from '../tomato';
import { USERS, removeUser_ } from './store';
interface User {
    name: string;
    lastname: string;
}
let users_: User[] = [
    { name: "user 1", lastname: "lastname 1" },
    { name: "user 2", lastname: "lastname 2" },
]
export class Comp4 {
    templateUrl = 'src/comp4.html';
    //children: any[] = [];

    users: User[] = USERS;
    //users: User[] = users_;

    removeUser = (user: User) => {
        console.log(user)
        removeUser_(user.name);
        users_.splice(users_.indexOf(user), 1);
    }

    total = this.users.length;
}