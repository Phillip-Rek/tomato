import { Comp3 } from './comp3';

export class Comp2 {
    constructor(public name: string, public lastname: string) {
        this.name = "phillip";
        this.lastname = 'rekhotho';

        //console.log('comp 2 has run', new Date());
    }

    templateUrl = 'src/comp2.html';
    children: Array<any> = [Comp3];

    test(arg: any) {
        console.log('test from component 2');
    }
}