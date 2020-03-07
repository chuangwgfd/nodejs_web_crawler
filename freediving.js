const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true, width: 1280, height: 1024});
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


async function step1() {
    console.log('走訪頁面');

    await nightmare
    .goto('https://msocean.com.tw/archives/category/freedive', headers)
    .wait('div.td-ss-main-content')
    .catch((err) =>{
        console.error(err);
    });
}

async function step2() {
    console.log('滾動頁面');

    let currentHeight = 0;
    let offset = 0;
    
    while (offset <= currentHeight) {
        currentHeight = await nightmare.evaluate(()=>{
            return document.documentElement.scrollHeight;
        });

        // 每次滾動 500 單位距離 offset 是定位 不是距離量, await(500)每0.5秒 執行下一次 太快有些網站會檔
        offset += 500;
        await nightmare.scrollTo(offset, 0).wait(1000);
        console.log(`offset: ${offset}, currentHeight: ${currentHeight}`)

        if (currentHeight - offset < 8000 && await nightmare.exists('a.td_ajax_load_more')) {
            await _checkPagination()
        }
    }
}

async function _checkPagination() {
    console.log('點擊加載');
    await nightmare
    .wait('a.td_ajax_load_more') //等到此元素出現時
    .click('a.td_ajax_load_more') //等到此元素出現時
}

async function step3() {
    console.log('擷取標題與連結')
    let html = await nightmare.evaluate(()=>{
        return document.documentElement.innerHTML;
    });

    let obj = {}

    $(html).find('div.td-ss-main-content div.td-block-span4')
    .each((index, element)=>{
        let title = $(element).find('h3.entry-title.td-module-title').text()

        let links = $(element).find('h3.entry-title.td-module-title>a').attr('href')

        obj.title = title
        obj.links = links

        arrLink.push(obj)
        obj = {}

    })
}

async function step4() {
    console.log('擷取內文內容')
    let obj2 = {}
    for (let i = 0; i < arrLink.length; i++) {

        let html = await nightmare
        .goto(arrLink[i].links, headers)
        .wait('div.td-pb-span8.td-main-content')
        .evaluate(()=>{
            return document.documentElement.innerHTML;
        });
            
    
        let mainTitle = $(html).find('div.td-post-header h1.entry-title').text()
        let authorName = $(html).find('div.td-post-header div.td-post-author-name a').text()
        let postDate = $(html).find('div.td-post-header span.td-post-date').text()
        let postViews = $(html).find('div.td-post-header div.td-post-views span').text()
        let content = $(html).find('div.td-post-content').html()
    
           
        arrLink[i].mainTitle = mainTitle
        arrLink[i].authorName = authorName
        arrLink[i].postDate = postDate
        arrLink[i].postViews = postViews
        arrLink[i].content = content

    }
}

async function close() {
    await nightmare.end((err)=>{
        if (err) throw err;
        console.log('關閉 nightmare')
    })
}

async function asyncArray(functionList) {
    for (let func of functionList) {
        await func();
    }
}

try{
    asyncArray([step1, step2, step3, step4, close]).then(async ()=>{
        console.dir(arrLink, {depth: null});

        await writeFile('downloads/freedive.json', JSON.stringify(arrLink, null, 4));
        
        console.log('Done')
    })
} catch(err){

}