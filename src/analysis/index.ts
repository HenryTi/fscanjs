import { Simulate } from "./simulate";
import { Step } from "./step";
import { TraderYearOverYear } from "./trader";
import { ROERank } from "./rank";

(async function () {
    let start = new Date(2019, 0, 1);
    let end = new Date(2019, 11, 31);
    let y = new Date(start.setFullYear(start.getFullYear()+1));
    console.log(y);
    
    let step = new Step(start, end);
    let actions = [
        {
            trader: new TraderYearOverYear(),
            rank: new ROERank(),
        }
    ];

    let simulate = new Simulate(step, actions);
    await simulate.run();
})();
