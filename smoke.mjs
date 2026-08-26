import pw from '/home/claude/.npm-global/lib/node_modules/playwright/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport:{ width:1280, height:900 } });
const errs = [];
p.on('console', m => { if (m.type()==='error' && !/ERR_TUNNEL_CONNECTION_FAILED|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: '+e.message));
await p.goto('file://'+process.cwd()+'/dist/index.html');
const say = (n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);

say('nav rendered', (await p.locator('.navlink').count()) > 15);
await p.click('a[href="#/platform"]');
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

await p.click('a[href="#/case/delta-sync"]');
await p.waitForTimeout(200);
say('write-up page routes', (await p.locator('h1').textContent()).includes('Delta sync'));
await p.click('a[href="#/how"]'); await p.waitForTimeout(200);
say('about page routes', (await p.locator('.kv dt').count()) >= 3);

// screenshots for the record
await p.goto('file://'+process.cwd()+'/dist/index.html#/platform');
await p.waitForSelector('#out table'); await p.waitForTimeout(300);
await p.screenshot({ path:'shot-platform.png', fullPage:false });
await p.goto('file://'+process.cwd()+'/dist/index.html#/');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-home.png', fullPage:false });
await p.emulateMedia({ colorScheme:'dark' });
await p.goto('file://'+process.cwd()+'/dist/index.html#/case/time-model');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-dark.png', fullPage:false });

say('no console errors ('+errs.length+')', errs.length===0);
if (errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
