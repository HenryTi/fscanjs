"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const historysina_1 = require("./historysina");
// let tsa = eval('[{symbol:"sh600000",code:"600000",name:"浦发银行",trade:"11.700",pricechange:"0.100",changepercent:"0.862",buy:"11.690",sell:"11.700",settlement:"11.600",open:"11.570",high:"11.790",low:"11.500",volume:46966016,amount:548219997,ticktime:"15:00:00",per:6.324,pb:0.749,mktcap:34341934.06449,nmc:32881403.76183,turnoverratio:0.16712},{symbol:"sh600004",code:"600004",name:"白云机场",trade:"15.940",pricechange:"-0.150",changepercent:"-0.932",buy:"15.940",sell:"15.950",settlement:"16.090",open:"16.010",high:"16.130",low:"15.780",volume:7840898,amount:124892409,ticktime:"15:00:03",per:28.982,pb:2.081,mktcap:3298496.899316,nmc:3298496.899316,turnoverratio:0.37891}]');
// function tevald(){
//   let vars = eval('var d_str="abcdfg"');
//   let fdsafa = 0;
// }
// let tsnew = eval('(new String("3623"))');
// tevald();
// let aaaa = 1;
// const urlOptions = {
//   uri: 'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/600036/displaytype/4.phtml',
//   //encoding: 'GB18030',
// };
// //s.fech(urlOptions.uri);
// const uris = [
//   'https://ddhq.sinajs.cn/list=sh601003,sh601001',
//   'https://hq.sinajs.cn/list=sh601003,sh601001',
//   'http://money.finance.sina.com.cn/corp/go.php/vFD_FinancialGuideLine/stockid/600036/displaytype/4.phtml',
// ];
// async function processUris() {
//   for (let uri of uris) {
//     try {
//     let ret = await fetchSinaContent(uri);
//     let s = 1;
//     }
//     catch(err){
//       debugger;
//     }
//   }
// }
//let runner = getRunner('mi');
//processUris();
//scanSinaQuotations();
historysina_1.scanSinaHistory(1500);
//scanSinaSymbols();
//scanEastmoney();
let a = 1;
//# sourceMappingURL=index.js.map