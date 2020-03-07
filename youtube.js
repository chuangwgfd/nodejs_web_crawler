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

let strSinger = '張學友'

// 初始化設定
async function step1() {
    try{
        if (!fs.existsSync('downloads')) {
            fs.mkdirSync('downloads');
        }
    } catch (err){
        throw err;
    }
}
// 
async function step2() {
    console.log('準備搜尋');

    await nightmare
    .goto('https://www.youtube.com', headers)
    .type('input#search', strSinger)
    .click('button#search-icon-legacy')
    .catch((err) =>{
        console.error(err);
    });
}
//滾動頁面
async function step3() {
    console.log('準備滾動頁面');

    let currentHeight = 0;
    let offset = 0;
    
    while (offset <= currentHeight) {
        currentHeight = await nightmare.evaluate(()=>{
            return document.documentElement.scrollHeight;
        });

        // 每次滾動 500 單位距離 offset 是定位 不是距離量, await(500)每0.5秒 執行下一次 太快有些網站會檔
        offset += 500;
        await nightmare.scrollTo(offset, 0).wait(500);

        if (offset > 2000) {
            break; // 滾動一段高度後,強迫跳出迴圈 //視情況使用
        }
    }
}

async function step4() {
    console.log('分析')

    let html = await nightmare.evaluate(()=>{
        return document.documentElement.innerHTML;
    })

    let pattern = null;
    let arrMatch = null;
    let obj = {};

    // 
    $(html)
    .find('div#contents.style-scope.ytd-item-section-renderer ytd-video-renderer.style-scope.ytd-item-section-renderer')
    .each((index, element)=>{
        let linkOfImage = $(element).find('img#img.style-scope.yt-img-shadow').attr('src');
        pattern = /https:\/\/i\.ytimg\.com\/vi\/([a-zA-Z0-9_]{11})\/hqdefault\.jpg/g;
        if ((arrMatch = pattern.exec(linkOfImage)) != null) {
            obj.img = arrMatch[0];
            obj.id = arrMatch[1];
    
    
            let titleOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .text();
            titleOfVideo = titleOfVideo.trim();
            obj.title = titleOfVideo;
    
            let linkOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .attr('href');
            linkOfVideo = 'https://www.youtube.com' + linkOfVideo;
            obj.link = linkOfVideo;
    
            obj.singer = strSinger;
    
            arrLink.push(obj);
    
            obj = {};
        }
    })

}

async function step5() {
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
    asyncArray([step1, step2, step3, step4, step5]).then(async ()=>{
        console.dir(arrLink, {depth: null});

        if ( !fs.existsSync('downloads/youtube.json')) {
            await writeFile('downloads/youtube.json', JSON.stringify(arrLink, null, 4));
        }

        console.log('Done')
    })
} catch(err){

}