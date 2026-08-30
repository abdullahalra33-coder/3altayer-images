// Flags which catalogue photos are usable as cut-outs.
//
// Most store shots are zoomed crops with the bottle running off the frame —
// fine as a full-bleed background, useless once you knock the white out and
// stand the bottle on a shelf. This marks the ones whose product sits wholly
// inside the frame, and writes k:1 on those rows in perfumes.json.
//
//   node tools/mood-studio/photo-quality.mjs
//
// Needs playwright (headless Chromium) for image decoding, and serves
// store_orig/ over localhost so the page loads the files directly.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || path.join(import.meta.dirname, '..', '..'));
const JSON_PATH = path.join(import.meta.dirname, 'perfumes.json');
const db = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

const ids = db.p.map(r => r.i).filter(Boolean)
  .filter(id => fs.existsSync(path.join(ROOT, 'store_orig', id + '.jpg')));
console.log(ids.length + ' صورة للفحص');

// The page must load the photos same-origin, or getImageData throws on a
// tainted canvas — so serve a blank page from the same host and navigate to it.
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/'){
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><meta charset=utf-8><canvas id=c width=240 height=240></canvas>');
    return;
  }
  const f = path.join(ROOT, url);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': 'image/jpeg' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;

const b = await chromium.launch();
const p = await b.newPage();
await p.goto(base + '/', { waitUntil:'domcontentloaded' });

const CHUNK = 200, clean = [];
for (let i = 0; i < ids.length; i += CHUNK){
  const part = await p.evaluate(async ({base, batch}) => {
    const c = document.getElementById('c'), g = c.getContext('2d', { willReadFrequently:true });
    const out = [];
    for (const id of batch){
      let im;
      try { im = await new Promise((res, rej) => {
        const x = new Image(); x.onload = () => res(x); x.onerror = rej;
        x.src = base + '/store_orig/' + id + '.jpg';
      }); } catch(_) { out.push(0); continue; }
      const S = 240;
      g.clearRect(0,0,S,S); g.drawImage(im, 0, 0, S, S);
      const d = g.getImageData(0,0,S,S).data;
      const white = i => d[i] > 236 && d[i+1] > 236 && d[i+2] > 236;
      let edge = 0, edgeTot = 0;
      for (let x=0;x<S;x++) for (const y of [0,1,S-2,S-1]){ const k=(y*S+x)*4; edgeTot++; if(!white(k)) edge++; }
      for (let y=0;y<S;y++) for (const x of [0,1,S-2,S-1]){ const k=(y*S+x)*4; edgeTot++; if(!white(k)) edge++; }
      let ink = 0, x0=S, x1=-1, y0=S, y1=-1;
      for (let y=0;y<S;y++) for (let x=0;x<S;x++){ const k=(y*S+x)*4;
        if(!white(k)){ ink++; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } }
      const inkFrac = ink/(S*S), edgeFrac = edge/edgeTot;
      const margin = Math.min(x0, y0, S-1-x1, S-1-y1);
      out.push(edgeFrac < 0.02 && inkFrac > 0.03 && inkFrac < 0.80 && margin >= 3 ? 1 : 0);
    }
    return out;
  }, { base, batch: ids.slice(i, i + CHUNK) });
  clean.push(...part);
  process.stdout.write('\r  ' + Math.min(i + CHUNK, ids.length) + '/' + ids.length);
}
console.log('');
await b.close();
server.close();

const ok = new Set(ids.filter((_, n) => clean[n]));
let on = 0;
for (const r of db.p){
  if (r.i && ok.has(r.i)){ r.k = 1; on++; } else if ('k' in r) delete r.k;
}
fs.writeFileSync(JSON_PATH, JSON.stringify(db));
console.log('صالحة للقص: ' + on + ' من ' + ids.length +
            '  (' + Math.round(on / ids.length * 100) + '%)');
