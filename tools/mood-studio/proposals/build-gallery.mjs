import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';

const D   = JSON.parse(fs.readFileSync('pool.json','utf8'));      // has _img
const ALL = JSON.parse(fs.readFileSync('perfumes.json','utf8'));  // full catalogue
const pick1 = (list,b,n) => list.find(r => r.b===b && r.n===n);
const find  = (b,n) => pick1(D.p,b,n) || pick1(ALL.p,b,n) || D.p.find(r => r.n===n);
const b64 = p => 'data:image/jpeg;base64,' + fs.readFileSync(p).toString('base64');
const snapD = fs.readFileSync('snap_path.txt','utf8').trim();

const FL = { ...find('FREDERIC MALLE','French Lover'), r:1150 };
const P1='photo1.jpg', P2='photo2.jpg';
const PICKS = [
  { id:'01', fn:'T1',  items:[FL], imgs:[P2] },
  { id:'02', fn:'T2',  items:[FL], imgs:[P1] },
  { id:'03', fn:'T3',  items:[FL], imgs:[P2] },
  { id:'04', fn:'T4',  items:[FL], imgs:[P1] },
  { id:'05', fn:'T5',  items:[FL], imgs:[P2] },
  { id:'06', fn:'T6',  items:[FL], imgs:[P1] },
  { id:'07', fn:'T7',  items:[FL], imgs:[P2] },
  { id:'08', fn:'T8',  items:[FL], imgs:[P1] },
  { id:'09', fn:'T9',  items:[FL], imgs:[P2] },
  { id:'10', fn:'T10', items:[FL], imgs:[P1] },
  { id:'11', fn:'C1',  items:[find('Montale','Black Aoud'), find('Mancera','The Aoud')], multi:1 },
  { id:'12', fn:'C2',  items:[find('Montale','Black Aoud'),find('Mancera','The Aoud'),find('Montale','Arabians'),
                              find('Mancera','Gold Prestigium'),find('Montale','Mukhallat')], multi:1, imgs:[P1] },
  { id:'13', fn:'C3',  items:[FL], imgs:[P2] },
  { id:'14', fn:'C4',  items:[find('Bentley','Intense'),find('Montale','Mukhallat'),find('Mancera','Black Line')], multi:1 },
  { id:'15', fn:'C5',  items:[find('Montale','Black Aoud'),find('Mancera','The Aoud'),
                              find('Montale','Arabians'),find('Mancera','Aoud Vanille')], multi:1, imgs:[P1] },
];
PICKS.forEach(p => p.items.forEach((r,i) => {
  if(!r || !r.b || !r.n) throw new Error('bad item in '+p.id+' idx '+i+': '+JSON.stringify(r));
  if(!p.imgs && !r._img) throw new Error('no image for '+p.id+' idx '+i+' ('+r.b+' '+r.n+')');
}));

const page_html = `
<canvas id="cv" width="1080" height="1920"></canvas>
<style>body{margin:0;background:#000}canvas{display:block}</style>
<script>const SNAP_D=${JSON.stringify(snapD)};</script>
<script>${fs.readFileSync('tpl-core.js','utf8')}</script>
<script>${fs.readFileSync('tpl-a.js','utf8')}</script>
<script>${fs.readFileSync('tpl-b.js','utf8')}</script>
<script>${fs.readFileSync('tpl-c.js','utf8')}</script>
<script>
ctx = document.getElementById('cv').getContext('2d');
window.__render = async (fn, items, imgs, D, multi) => {
  ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,1080,1920);
  ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0; ctx.letterSpacing='0px';
  const I = await Promise.all(imgs.map(src => new Promise((res,rej)=>{
    const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src; })));
  window[fn](multi ? items : items[0], I, D);
  return true;
};
</script>`;
fs.writeFileSync('gallery-render.html', page_html);

const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:1 });
const errs=[];
p.on('pageerror', e=>errs.push(e.message));
p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.route('https://fonts.googleapis.com/**', r=>r.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('fonts/gf.css','utf8')}));
await p.route('**/f*.woff2', r=>{ try{ r.fulfill({status:200,contentType:'font/woff2',body:fs.readFileSync('fonts/'+r.request().url().split('/').pop())}); }catch(e){ r.abort(); }});
await p.setContent('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Readex+Pro:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700;900&display=swap">'+page_html,
  { waitUntil:'networkidle' });
await p.evaluate(async ()=>{ await Promise.all([
  '300 40px Tajawal','400 40px Tajawal','500 40px Tajawal','700 40px Tajawal',
  '600 40px Caveat','300 40px "Readex Pro"','400 40px "Readex Pro"','500 40px "Readex Pro"','600 40px "Readex Pro"'
].map(f=>document.fonts.load(f,'معاينة Aa'))); await document.fonts.ready; });

fs.mkdirSync('out', { recursive:true });
for (const pick of PICKS){
  const imgs = (pick.imgs || pick.items.map(r => r._img)).map(b64);
  await p.evaluate(([fn,items,imgs,D,multi]) => window.__render(fn,items,imgs,D,multi),
                   [pick.fn, pick.items, imgs, D, !!pick.multi]);
  await p.waitForTimeout(160);
  await p.locator('#cv').screenshot({ path:`out/${pick.id}.png` });
  const names = pick.items.map(r=>r.b+' — '+r.n).join('  /  ');
  console.log(`  ${pick.id}  ${pick.fn.padEnd(4)}  ${names}`);
}
console.log('errors:', errs.length); errs.slice(0,10).forEach(e=>console.log('  !',e));
await b.close();
