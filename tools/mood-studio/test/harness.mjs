// آلة الفحص المشتركة.
//
// ليه خادم محلي ومو file:// — صور المتجر تُرسم على canvas، وفي file:// يرفضها
// المتصفح بـ CORS فتطلع القارورة والدولاب فاضيين وكل فحص بصري يكذب.
//
// شغّل أي فحص من مجلد tools/mood-studio:
//   node test/smoke.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureFonts, CACHE } from './fonts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');            // جذر المستودع
const TYPES = { '.html':'text/html; charset=utf-8', '.jpg':'image/jpeg',
                '.png':'image/png', '.json':'application/json', '.mjs':'text/javascript' };

export async function openStudio(opts = {}){
  await ensureFonts();

  const server = http.createServer((q, s) => {
    const url = decodeURIComponent(q.url.split('?')[0]);
    const file = path.join(ROOT, url);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
      s.writeHead(404); s.end(); return;
    }
    s.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(s);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1280, height:1000 }, acceptDownloads:true });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.route('https://fonts.googleapis.com/**', r =>
    r.fulfill({ status:200, contentType:'text/css',
                body: fs.readFileSync(path.join(CACHE, 'gf.css'), 'utf8') }));
  await page.route('**/_font/*.woff2', r => {
    try{ r.fulfill({ status:200, contentType:'font/woff2',
                     body: fs.readFileSync(path.join(CACHE, path.basename(r.request().url()))) }); }
    catch(_){ r.abort(); }
  });

  const url = base + '/tools/mood-studio/index.html';
  await page.goto(url, { waitUntil:'networkidle' });
  // الحالة محفوظة في localStorage، فأي فحص يبدأ من إعدادات أمس ما هو فحص
  await page.evaluate(() => { try{ localStorage.clear(); }catch(_){ } });
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(opts.settle || 2500);
  await page.evaluate(() => document.querySelectorAll('details.card').forEach(d => d.open = true));

  return { server, browser, page, errors, base, url, close: async () => {
    await browser.close(); server.close();
  }};
}

/* ---------- أدوات صغيرة تتكرر في كل فحص ---------- */

// اختر أول عطر يطابق البحث من الكتالوج
export async function pickPerfume(page, query, match){
  await page.fill('#storeSearch', query);
  await page.waitForTimeout(800);
  for (const opt of await page.$$('#storeList .accord-opt')){
    const text = (await opt.textContent()).trim();
    if (!match || match.test(text)){ await opt.dispatchEvent('mousedown'); await page.waitForTimeout(900); return text; }
  }
  throw new Error('ما لقيت عطر لـ ' + query);
}

// تركيب الدولاب يقص عشرات القوارير ويأخذ ثواني — لا تقيس قبل ما يخلص.
// انتظر «ready» بالتحديد لا «مو building»: بعد اختيار «المكتبة» يمرّ جزء من
// الثانية قبل ما يرفع الكود علم البناء، فسؤال مبكر يرجع «مو building» وأنت
// في الحقيقة تنظر إلى لوح «… أجهّز الخلفية» — وهو ثابت، فحتى انتظار استقرار
// الإطار ينخدع فيه.
export async function waitForCabinet(page, ms = 90000){
  await page.waitForTimeout(700);
  await page.waitForFunction(() => document.documentElement.dataset.cabinet === 'ready', { timeout: ms });
  await page.waitForTimeout(600);
}

// القص غير متزامن: الدولاب يجهز قبل القارورة، فلقطة تُؤخذ بعد «جهز الدولاب»
// مباشرة قد تكون بلا قارورة — وكل مقارنة بعدها تكذب. انتظر حتى يثبت الإطار.
export async function waitStable(page, tries = 40){
  let prev = null;
  for (let i = 0; i < tries; i++){
    const now = await sig(page);
    if (now === prev) return true;
    prev = now;
    await page.waitForTimeout(450);
  }
  return false;
}

// خزّن لقطة بكسلات باسم داخل الصفحة — نقلها إلى Node يأخذ دقائق
export const snap = (page, key) => page.evaluate(k => {
  window.__snaps = window.__snaps || {};
  window.__snaps[k] = document.querySelector('#cv').getContext('2d').getImageData(0, 0, 1080, 1920).data;
  return true;
}, key);

// كم بكسل اختلف بين لقطتين داخل شريط أفقي
export const diff = (page, a, b, x0 = 0, x1 = 1080) => page.evaluate(({a,b,x0,x1}) => {
  const A = window.__snaps[a], B = window.__snaps[b];
  let n = 0;
  for (let y = 0; y < 1920; y++) for (let x = x0; x < x1; x++){
    const i = (y * 1080 + x) * 4;
    if (Math.abs(A[i]-B[i]) + Math.abs(A[i+1]-B[i+1]) + Math.abs(A[i+2]-B[i+2]) > 18) n++;
  }
  return n;
}, {a,b,x0,x1});

// بصمة الإطار كامل — للمقارنة السريعة «تغيّر أو ما تغيّر»
export const sig = page => page.evaluate(() => {
  const d = document.querySelector('#cv').getContext('2d').getImageData(0, 0, 1080, 1920).data;
  let h = 2166136261;
  for (let i = 0; i < d.length; i += 13){ h ^= d[i]; h = Math.imul(h, 16777619); }
  return h >>> 0;
});

export const setRange = (page, id, v) =>
  page.$eval('#' + id, (el, val) => { el.value = val; el.dispatchEvent(new Event('input', { bubbles:true })); }, String(v));

// سبب الإطفاء المكتوب تحت مؤشر
export const whyOff = (page, id) => page.evaluate(i => {
  const el = document.querySelector('#' + i);
  const host = el && (el.closest('.slider-row') || el.closest('.field') || el.parentElement);
  const note = host && host.querySelector('.why');
  return note ? note.textContent : '';
}, id);

// احفظ الإطار الحالي ملفاً — انظر إليه، لا تكتفِ بالأرقام
export async function shot(page, file){
  const b64 = await page.evaluate(() => document.querySelector('#cv').toDataURL('image/png').split(',')[1]);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  return file;
}

/* ---------- تقرير ---------- */
export function reporter(){
  const rows = [];
  const ok = (name, pass, extra) => {
    rows.push([!!pass, name, extra || '']);
    console.log((pass ? 'PASS' : 'FAIL') + ' ' + name + (extra ? '   — ' + extra : ''));
  };
  const done = () => {
    const good = rows.filter(r => r[0]).length;
    console.log('\n' + good + '/' + rows.length);
    return good === rows.length;
  };
  return { ok, done, rows };
}
