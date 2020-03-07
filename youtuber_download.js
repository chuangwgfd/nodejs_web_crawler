const util = require('util');
const fs = require('fs');
// 讓程式可以執行 shell指令
const exec = util.promisify( require('child_process').exec );
const readFile = util.promisify(fs.readFile);

(
    async function(){
        let strJson = await readFile('downloads/youtube.json', {encoding: 'utf-8'});
        let arrJson = JSON.parse(strJson);
        // console.log(arrJson);

        for (let i = 0; i < arrJson.length; i++) {
            console.log(arrJson);
            if (i === 2) {
                await exec(`youtube-dl -f mp4 -i ${arrJson[i].link} -o "downloads/%(id)s.%(ext)s"`)
                break;
            }
            
        }


    }

)();


// exec(`youtube-dl -f mp4 -i https://www.youtube.com/watch?v=O9JBVray8Ic -o "downloads/%(id)s.%(ext)s"`)