const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: false, width: 1024, height: 768})
const util = require('util')
const fs = require('fs')
// 引入 jQuery 機制
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const { window } = new JSDOM()
const $ = require('jquery')(window)
// 非同步化 await
const writeFile = util.promisify(fs.writeFile)
// 設定標頭
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
}
// 存整包資料的陣列
let arrLink = []
// 環境建置
// async function beforeStart() {
//     console.log('檢查環境/設置環境')
//     try{
//         if (!fs.existsSync('downloads')) {
//             fs.mkdirSync('downloads')
//         }
//     } catch (err){
//         throw err
//     }
// }
// 啟動 nightmare
async function step1() {
    console.log('step1')
    let html = await nightmare
    .goto('https://www.bookwormzz.com/zh/',headers)
    .wait('ul.ui-listview.ui-listview-inset.ui-corner-all.ui-shadow')
    .evaluate(()=>{
        return document.documentElement.innerHTML
    })

    let obj = {}
    
    $(html).find('ul.ui-listview.ui-listview-inset.ui-corner-all.ui-shadow')
    .each((index, element)=>{
        $(element).find('li>a')
        .each((idx, elm)=>{
            console.log($(elm).attr('href'))
            let url = $(elm).attr('href').slice(2)  // 去掉前面..
            obj.url = decodeURI('https://www.bookwormzz.com'+url+'#book_toc') 

            let title = $(elm).text()
            obj.title = title
            obj.links = []

            arrLink.push(obj)
            obj = {}
        })
    })
}
// 
async function step2() {
    console.log('step2')
    let links = []
    for (let i = 0; i < arrLink.length; i++) {
        console.log(arrLink[i].url)
        let html = await nightmare
        .goto(arrLink[i].url)
        .wait('div.ui-content')
        .evaluate(()=>{
            return document.documentElement.innerHTML
        })
        
        let obj2 = {}
        
        $(html).find('div.ui-content li>a')
        .each((index, element)=>{
            let url = $(element).attr('href')
            obj2.url = 'https://www.bookwormzz.com'+url
            
            let title = $(element).text()
            obj2.title = title
            // obj.links = []
            // console.log(obj2)
            // obj.links.push(obj2)
            // arrLink[i].link.push(obj2)
            links.push(obj2)
            obj2 = {}
            
        })
        
        arrLink[i].links = links
        
        links = []
    }
}
//
async function step3() {
    console.log('step3')
    for (let i = 0; i < arrLink.length; i++) {
        console.log(arrLink[i].title)
        let content = ''
        for (let j = 0; j < arrLink[i].links.length; j++) {
            console.log(arrLink[i].links[j].url)
            let html = await nightmare
            .goto(arrLink[i].links[j].url)
            .wait('div#html.ui-content')
            .evaluate(()=>{
                return document.documentElement.innerHTML
            })

            content = $(html).find('div#html.ui-content div:eq(0)').text()

            content = content.replace(/\r\n|\n/g,"") // 去除空白、換行
            
            arrLink[i].links[j].content = content
            
            content = '' // 初始化
            
            console.log(arrLink[i].links[j].title)
            
        }
        // if (i>3) break 
    }
}
// 關閉 nightmare
async function close() {
    await nightmare.end(()=>{
        console.log('nightmare 關閉')
    })
}
// 用迴圈依序執行
async function asyncArray(functionList) {
    for (let func of functionList) {
        await func()
    }
}
//主程式區域
try {
    asyncArray([step1, step2, step3, close]).then(async () => {
        console.log('程式結束') 
        
        await writeFile('downloads/jinyong.json', JSON.stringify(arrLink, null, 4))
        
    })
} catch (err) {
    console.log('try-catch: ')
    console.dir(err, {depth: null})
}