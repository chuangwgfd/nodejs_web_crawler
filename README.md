# node.js 爬蟲：Nightmare & cURL
 - 運用 Nightmare.js 爬取動態網頁
 - 運用 cURL 爬取靜態網頁  
### 應用面
 - 資料爬取大量資料
 - 自動化測試
 
### 使用技術
 - node.js
 - cURL
 - jQuery selector
 - Regular Expression
 - JavaScript (ES6)
### 使用套件
 - nightmare (爬蟲主套件)
 - jquery
 - jsdom
 - moment
### 案例介紹
#### youtube.js
  > nightmare 走訪 youtube.com，輸入關鍵字後搜尋，模擬滾輪下捲加載動態生成頁面  
  > 捲動後擷取節點資訊，將資料轉換 json 存入 downloads  
#### 104.js
  > 104搜尋職缺、選取地點、職務類別，增加操作複雜度  
  > 捲動多一個事件，當即將捲動到底時多一個點按加載，後續同樣將資料轉換存入 downloads
#### JinYong.js
  > 走訪金庸線上小說，先取得每一系列的連結，再進入連結取得各回標題  
  > 再進入各回連結取得每回內容，一樣轉換儲存（ 總共約977回 ）
