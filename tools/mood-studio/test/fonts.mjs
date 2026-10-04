// الصفحة تسحب خطوطها من Google Fonts، والمتصفح داخل الفحص ما يوصلها. فننزّلها
// مرة وحدة من Node ونخدمها للصفحة محلياً — بدونها يرجع النص لخط النظام وتتغيّر
// كل قياسات البكسل، فتطلع إخفاقات وهمية.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CACHE = path.join(HERE, '.fonts');
const CSS_URL = 'https://fonts.googleapis.com/css2'
  + '?family=Caveat:wght@500;600;700'
  + '&family=Readex+Pro:wght@300;400;500;600;700'
  + '&family=Tajawal:wght@300;400;500;700;900&display=swap';
// بدون user-agent حديث، Google ترجّع صيغة ttf قديمة
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

export async function ensureFonts(){
  const cssPath = path.join(CACHE, 'gf.css');
  if (fs.existsSync(cssPath)) return cssPath;
  fs.mkdirSync(CACHE, { recursive: true });
  const res = await fetch(CSS_URL, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error('fonts css ' + res.status);
  let css = await res.text();
  const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]
    .map(m => m[1]))];
  let n = 0;
  for (const u of urls){
    const name = 'f' + (n++) + '.woff2';
    const r = await fetch(u, { headers: { 'user-agent': UA } });
    if (!r.ok) throw new Error('font ' + r.status + ' ' + u);
    fs.writeFileSync(path.join(CACHE, name), Buffer.from(await r.arrayBuffer()));
    css = css.split(u).join('/_font/' + name);
  }
  fs.writeFileSync(cssPath, css);
  return cssPath;
}
