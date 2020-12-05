interface User {
    name: string;
    lastname: string;
}

export let USERS: User[] = [
    { name: 'user_1', lastname: 'lastname_1' },
    { name: 'user_2', lastname: 'lastname_2' },
    { name: 'user_3', lastname: 'lastname_3' },
    { name: 'user_4', lastname: 'lastname_4' },
    { name: 'user_5', lastname: 'lastname_5' },
    { name: 'user_6', lastname: 'lastname_6' },
    { name: 'user_7', lastname: 'lastname_7' },
    { name: 'user_8', lastname: 'lastname_8' }
]

export const removeUser_ = (username: String) => {
    USERS = USERS.filter(user => user.name !== username);
}