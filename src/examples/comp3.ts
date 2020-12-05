import { Comp4 } from './comp4';
export class Comp3 {
    templateUrl = 'src/comp3.html';
    children: Array<any> = [Comp4];

    a = "test from component 3";
    b = "test 2"
}