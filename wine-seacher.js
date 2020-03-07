const fs = require('fs');
const util = require('util');
const moment = require('moment');

const exec = util.promisify( require('child_process').exec );

//引入 jQuery 機制
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);


//瀏覽器標頭，讓對方得知我們是人類，而非爬蟲
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//放久資料的陣列
let arrLink = [];

//走訪網址
let url = `https://www.wine-searcher.com/find/latour+pauillac+medoc+bordeaux+france/2006/taiwan#t3`;
let arrUrl =[
    'https://www.wine-searcher.com/find/latour+pauillac+medoc+bordeaux+france/2006/taiwan#t3',
    'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3'


]

(
    async function () {
        for (const iterator of object) {
            
        }
        let {stdout, stderr} = await exec(`curl -X GET ${url} -L -H "User-Agent: ${headers['User-Agent']}" -H "Accept-Language: ${headers['Accept-Language']}" -H "Accept: ${headers['Accept']}"`)
        let strChartData = ''; //價格 json 文字資料
        let dataChartData = {}; //將 json 轉成物件型態
        let arrMain = []; //放置價格物件的陣列
        let strDatetime = ''; //放置日期時間
        let price = 0; //價格

        // console.log(stdout);


        let pattern =/https:\/\/www\.wine-searcher\.com\/find\/([a-z+]+)\/(1[0-9]{3}|20[0-9]{2})\/taiwan＃t3/g;
        let arrMatch = null;
        let strJsonFileName = '';

        if ((arrMatch = pattern.exec(url)) !== null) {
            // console.log(arrMatch);

            strJsonFileName = arrMatch[1];

            strJsonFileName = strJsonFileName.replace(/\+/g, '_');

            strJsonFileName = strJsonFileName + '_' + arrMatch[2];
        }

        console.log(strJsonFileName)
        strChartData = $(stdout).find(`div#hst_price_div_detail_page.card-graph`).attr('data-chart-data');

        dataChartData = JSON.parse(strChartData);
        arrMain = dataChartData.chartData.main;

        for (let arr of arrMain) {
            // arr[0]: 時間戳記 
            // arr[0]: 價格

            strDatetime = moment.unix(parseInt(arr[0]/1000)).format("YYYY-MM-DD");

            price = Math.round(arr[1]);

            console.log(`年月日：${strDateTime}`)
            console.log(`價格美金：${price}元,換算為新台幣為：${price * 30}元`)

            arrLink.push({
                'dateTime': strDatetime,
                'price_us': price,
                'price_tw': (price * 30)
            })

        }
        await fs.writeFileSync(`downloads/${strJsonFileName}.json`, JSON.stringify(arrLink, null, 4));

        arrLink = [];
    }
)();