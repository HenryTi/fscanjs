import { Simulate } from "./simulate";

(async function () {
    let simulate = new Simulate(
        new Date(2019, 0, 1),
        new Date(2019, 11, 31),
        'tradeYearOverYear',
        'ROE'
    );
    await simulate.run();
})();
