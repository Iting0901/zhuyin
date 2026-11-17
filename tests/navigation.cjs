// Run with NODE_PATH pointing to an installed Playwright package directory.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const prefix = '/zhuyin/';
const server = http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if (!pathname.startsWith(prefix)) {res.writeHead(404).end();return;}
  let file = path.resolve(root, pathname.slice(prefix.length));
  if (!file.startsWith(root + '/') && file !== root) {res.writeHead(403).end();return;}
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.pdf':'application/pdf'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true, ...(process.env.CHROME_CHANNEL ? {channel:process.env.CHROME_CHANNEL} : {})});
 try {
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
 const base=`http://127.0.0.1:${server.address().port}${prefix}`;
 await page.goto(base); await page.waitForSelector('[data-action="symbols"]');
 assert.equal(await page.locator('a[href="content_v3.html"]').count(),1);
 const nav=async(p)=>{await page.locator(`.nav [data-page="${p}"]`).click();};
 const action=async(a)=>{await page.locator(`[data-action="${a}"]`).first().click();};
 const heading=async(text)=>assert(await page.getByRole('heading',{name:text,exact:true}).isVisible());
 // Every map card action and quick navigation must reach its destination.
 await action('symbols'); await heading('符號圖鑑');
 await nav('map'); await action('story'); await heading('故事探險任務');
 for(const [a,h] of [['quiz','聲音尋寶'],['write','足跡書寫研究所'],['blend','拼音訓練場'],['story','故事探險任務']]){await nav('map');await action(a);await heading(h);}
 for(const [p,h] of [['map','探險地圖'],['symbols','符號圖鑑'],['quiz','聲音尋寶'],['write','足跡書寫研究所'],['blend','拼音訓練場'],['story','故事探險任務'],['progress','家長觀察中心']]){await nav(p);await heading(h);}
 await nav('symbols');await action('mark|ㄇ|read|2');
 await action('choosewrite|ㄇ');await heading('足跡書寫研究所');
 const canvas=page.locator('#draw');const rect=await canvas.boundingBox();
 await page.mouse.move(rect.x+30,rect.y+30);await page.mouse.down();await page.mouse.move(rect.x+90,rect.y+90,{steps:5});await page.mouse.up();
 assert(await canvas.evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v)));
 await action('undo');assert(await canvas.evaluate(c=>!c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v)));
 await action('clearcanvas');await page.locator('#writing-select').selectOption('ㄚ');await action('mark|ㄚ|write|2');
 await nav('quiz');const answer=await page.locator('details .symbol').textContent();
 await action('answer|'+answer);assert.match(await page.locator('#quiz-feedback').innerText(),/正確/);
 const wrong=await page.locator('.choices button').allTextContents();await action('answer|'+wrong.find(s=>s!==answer));assert.match(await page.locator('#quiz-feedback').innerText(),/再聽/);await action('nextquiz');
 await nav('blend');await action('nextsyllable');
 await nav('story');await action('nextmission');await action('prevmission');await page.locator('[data-action^="mission|"]').last().click();
 if(await page.locator('[data-action="showanswer"]').count()){await action('showanswer');assert.match(await page.locator('#story-answer').innerText(),/參考答案/);}
 await action('complete');
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('zhuyin-explorer-v2')));
 let state=await stored();assert.equal(state.records['ㄇ'].read,2);assert.equal(state.records['ㄚ'].write,2);assert.equal(state.journal.length,1);
 await page.reload();assert.deepEqual(await stored(),state);
 await nav('map');page.once('dialog',d=>d.accept());await action('unlock|8');
 await nav('symbols');assert.equal(await page.locator('.symbol-card').count(),37);
 await nav('story');assert.equal(await page.locator('[data-action^="mission|"]').count(),32);
 await nav('progress');
 for(const a of ['export','csv']) {const download=page.waitForEvent('download');await action(a);assert((await download).suggestedFilename().endsWith(a==='csv'?'.csv':'.json'));}
 const backup=await stored();await page.locator('#import-file').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.getByRole('status').filter({hasText:'匯入完成'}).waitFor();assert.deepEqual(await stored(),backup);
 // Cancel reset: existing learner records must remain untouched.
 page.once('dialog',d=>d.dismiss());await action('reset');assert.deepEqual(await stored(),backup);
 await nav('map');
 const links=await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.href));
 for(const url of links){assert(url.startsWith(base));const response=await page.request.get(url);assert.equal(response.status(),200,url);}
 await page.getByRole('link',{name:/V3 完整教學內容/}).click();assert.match(page.url(),/\/zhuyin\/zhuyin_adventure_v3_content_review\/content_v3.html$/);
 await page.getByRole('link',{name:'← 回遊戲首頁'}).click();await heading('探險地圖');
 await page.setViewportSize({width:390,height:844});await action('symbols');await heading('符號圖鑑');
 if(process.env.SCREENSHOT_PATH) await page.screenshot({path:process.env.SCREENSHOT_PATH,fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: navigation, quiz, writing, story, progress, 37 symbols, 32 missions, import/export, persistence, mobile and /zhuyin/ paths; no console errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
