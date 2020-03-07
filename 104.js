const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true, width: 1024, height: 768});
const util = require('util');
const fs = require('fs');
// 
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

// 
const writeFile = util.promisify(fs.writeFile)

const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};
let arrLink = [];

// 關鍵字
let strKeyword = 'node.js'

//進行搜尋
async function search() {
    console.log('進行檢索');
    
    await nightmare
    .goto('https://www.104.com.tw/',headers)
    .type('input#ikeyword', strKeyword)
    .wait(2000)
    .click('span#icity')
    .wait(2000)
    .click('div.second-floor-rect input[value="6001001000"]')
    .wait(2000)
    .click('div.second-floor-rect input[value="6001002000"]')
    .wait(2000)
    .click('button.category-picker-btn-primary')
    .wait(2000)
    .click('button.btn.btn-primary.js-formCheck')
    .catch((err)=>{
        throw err;
    });

}
// 跳頁後選擇全職,兼職等選項
async function setJobType() {
    console.log('選擇全職')
    
    await nightmare
    .click('ul.b-nav-tabs>li[data-value="1"]')
}
// 滾動滾輪
async function scrollPage() {
    console.log('滾動頁面');

    let currentHeight = 0;
    let offset = 0;
    
    while (offset <= currentHeight) {
        currentHeight = await nightmare.evaluate(()=>{
            return document.documentElement.scrollHeight;
        });

        // 每次滾動 500 單位距離 offset 是定位 不是距離量, await(500)每0.5秒 執行下一次 太快有些網站會檔
        offset += 300;
        await nightmare.scrollTo(offset, 0).wait(500);
        console.log(`offset: ${offset}, currentHeight: ${currentHeight}`)

        if (offset > 500) break

        if ( currentHeight - offset < 2000 && await nightmare.exists('button.b-btn.b-btn--link.js-more-page')) {
            await _checkPagination()
        }
    }
}

// 捲到底時按下一頁
async function _checkPagination() {
    await nightmare
    .wait('button.b-btn.b-btn--link.js-more-page') //等到此元素出現時
    .click('button.b-btn.b-btn--link.js-more-page') //等到此元素出現時
}

async function parseHtml() {
    

    let html = await nightmare.evaluate(()=>{
        return document.documentElement.innerHTML;
    });

    let obj ={};

    $(html)
    // 找出每個職缺 用迴圈抓取資料放進陣列
    .find('div#js-job-content article')
    .each((index, element)=>{
        // 找到左邊區塊
        let elm = $(element).find('div.b-block__left');

        let position = elm.find('h2.b-tit a.js-job-link').text();
        let positionLink = 'https:' +elm.find('h2.b-tit a.js-job-link').attr('href');
        let location = elm.find('ul.b-list-inline.b-clearfix.job-list-intro.b-content li:eq(0)').text();
        let companyName = elm.find('ul.b-list-inline.b-clearfix li a').text().trim();
        let companyLink = 'https:' +elm.find('ul.b-list-inline.b-clearfix li a').attr('href');
        let category = elm.find('ul.b-list-inline.b-clearfix li:eq(2)').text();
        // console.log(`$(location),$(companyName)`)
        
        obj.i = index;
        obj.keyword = strKeyword;
        obj.position = position;
        obj.positionLink = positionLink;
        obj.location = location;
        obj.companyName = companyName;
        obj.companyLink = companyLink;
        obj.category = category;

        arrLink.push(obj);

        obj = {} // 記得初始化

        
    })

}

async function getDetail() {
    for (let i = 0; i < arrLink.length; i++) {
        // 前往影片播放頁面，取得
        let html = await nightmare
        .goto(arrLink[i].positionLink)
        .wait('div.job-description-table.row div.row.mb-2')
        .evaluate(()=>{
            return document.documentElement.innerHTML
        })

        // 取得上班地點
        let positionPlace = $(html)
        .find('div.job-description-table.row div.row.mb-2:eq(3) p.t3.mb-0')
        .text().trim()

        console.log(positionPlace)
        arrLink[i].positionPlace = positionPlace
    }
}






// 關閉 nightmare
async function close() {
    await nightmare.end(()=>{
        console.log('nightmare 關閉')
    })
}


async function asyncArray(functionList) {
    for (let func of functionList) {
        await func();
    }
}

try{
    asyncArray([search, setJobType, scrollPage, parseHtml, getDetail,close]).then(async ()=>{
        console.dir(arrLink, {depth: null});

        
        await writeFile('downloads/104.json', JSON.stringify(arrLink, null, 4));
        

        console.log('Done')
    })
} catch(err){

}