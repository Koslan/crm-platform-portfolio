import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1280, height:900 } });
const errs = [];
p.on('console', m => { if (m.type()==='error' && !/ERR_TUNNEL_CONNECTION_FAILED|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: '+e.message));
await p.goto('file://'+process.cwd()+'/dist/index.html');
const say = (n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);

say('tabs rendered', (await p.locator('.tabs a').count()) === 5);
say('about is the front page', (await p.locator('h1').first().textContent()).includes('Kostiantyn'));
await p.click('.tabs a[href="#/zoho"]');
await p.waitForTimeout(200);
say('a tab lists its pages', (await p.locator('a[href^="#/p/"]').count()) > 15);
await p.click('a[href="#/p/platform"]');
await p.waitForSelector('#out table', { timeout:5000 });
say('console ran the default query', (await p.locator('#out table tbody tr').count()) > 0);
say('counters visible', (await p.locator('.counter').count()) >= 6);

await p.click('button[data-q="2"]');           // paging ceiling
await p.waitForTimeout(400);
const meta = await p.locator('#meta').textContent();
say('paging ceiling reported: '+meta.trim(), /200 of \d+/.test(meta) && /more_records=true/.test(meta));

await p.click('button[data-q="1"]');           // dotted lookup
await p.waitForTimeout(400);
say('dotted lookup query returns rows', (await p.locator('#out table tbody tr').count()) > 0);

await p.click('#chaos button[data-m="expired"]');
await p.waitForTimeout(400);
say('failure switch surfaces the error', (await p.locator('.errbox').count()) === 1);
await p.click('#chaos button[data-m="off"]');
await p.waitForTimeout(400);
say('recovers when switched back', (await p.locator('#out table').count()) === 1);

await p.goto('file://'+process.cwd()+'/dist/index.html#/p/delta-sync');
await p.waitForTimeout(300);
say('write-up page routes', (await p.locator('h1').textContent()).includes('Delta sync'));

// the routes the site used to publish still resolve
await p.goto('file://'+process.cwd()+'/dist/index.html#/case/delta-sync');
await p.waitForTimeout(300);
say('an old write-up link still lands', (await p.evaluate(() => location.hash)) === '#/p/delta-sync');
await p.goto('file://'+process.cwd()+'/dist/index.html#/rec/contact');
await p.waitForTimeout(300);
say('an old demo link still lands', (await p.evaluate(() => location.hash)) === '#/p/history');
await p.goto('file://'+process.cwd()+'/dist/index.html#/how');
await p.waitForTimeout(300);
say('the site page carries its legend', (await p.locator('.kv dt').count()) >= 3);

// screenshots for the record
await p.goto('file://'+process.cwd()+'/dist/index.html#/p/platform');
await p.waitForSelector('#out table'); await p.waitForTimeout(300);
await p.screenshot({ path:'shot-platform.png', fullPage:false });
await p.goto('file://'+process.cwd()+'/dist/index.html#/');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-home.png', fullPage:false });
await p.goto('file://'+process.cwd()+'/dist/index.html#/p/time-model');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-writeup.png', fullPage:false });

say('no console errors ('+errs.length+')', errs.length===0);
if (errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
