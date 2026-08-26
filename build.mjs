import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const tpl  = readFileSync('src/app.html','utf8');
const mock = readFileSync('platform/mockZoho.js','utf8');
const data = readFileSync('data/dataset.slim.json','utf8');
const out  = tpl.replace('/*__MOCKZOHO__*/', () => mock).replace('/*__DATASET__*/null', () => data);
mkdirSync('dist',{recursive:true});
writeFileSync('dist/index.html', out);
console.log('dist/index.html', (out.length/1024).toFixed(0)+' KB');
