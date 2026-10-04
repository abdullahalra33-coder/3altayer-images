// فحص الأساسيات — كل واحد منها انكسر مرة من قبل.
//   node test/smoke.mjs
import fs from 'node:fs';
import { openStudio, pickPerfume, waitForCabinet, waitStable, snap, diff, sig,
         setRange, whyOff, shot, reporter } from './harness.mjs';

const { page, errors, close } = await openStudio();
const { ok, done } = reporter();

/* ١ — الكتالوج يعبّي كل شي بضغطة */
await pickPerfume(page, 'amberwood');
const filled = await page.evaluate(() => Object.fromEntries(
  ['brand','pname','nTop','nHeart','nBase','perfumer','year','longevity','sillage']
    .map(i => [i, document.querySelector('#' + i).value])));
ok('الكتالوج يعبّي البراند والهرم والمُعطِّر',
   filled.brand && filled.pname && filled.nTop && filled.perfumer && filled.year,
   filled.pname);
ok('الثبات والفوحان يتعبّون', Number(filled.longevity) > 0 && Number(filled.sillage) > 0,
   filled.longevity + '/' + filled.sillage);

/* ٢ — حقل رفع الصورة ما يقفل على نفسه */
ok('حقل رفع الصورة شغّال وما فيه صورة بعد',
   (await page.$eval('#photoIn', e => e.disabled)) === false);

/* ٣ — شكل المكتبة يبني دولاباً ويوقّف القارورة */
await page.fill('#feeling', 'ستيني ثري من عائلة طرطشلي');
await page.fill('#note', 'رشّة وحدة تكفي ليوم كامل وما تحتاج تعيد');
await page.selectOption('#layout', 'shelf');
await waitForCabinet(page);
await waitStable(page);
await snap(page, 'auto');
// شاشة سودا أو لوح «أجهّز الخلفية» = لون واحد تقريباً. صورة دولاب فيها تدرّج.
const levels = await page.evaluate(() => {
  const d = document.querySelector('#cv').getContext('2d').getImageData(0, 0, 540, 1920).data;
  const seen = new Uint8Array(256);
  for (let i = 0; i < d.length; i += 4) seen[Math.round(0.3*d[i] + 0.6*d[i+1] + 0.1*d[i+2])] = 1;
  return seen.reduce((a, b) => a + b, 0);
});
ok('الدولاب انرسم مو شاشة سودا', levels > 60, levels + ' درجة إضاءة في جهة الدولاب');

/* ٤ — الخيارات الأربعة لشكل العطر */
const modes = {};
for (const m of ['auto','cut','card','none']){
  await page.selectOption('#heroMode', m);
  await waitStable(page);
  modes[m] = await sig(page);
}
ok('«على كرت» و«بدون صورة» كل واحد يعطي إطاراً مختلفاً',
   modes.card !== modes.auto && modes.none !== modes.auto && modes.card !== modes.none);
// auto و cut يتطابقان لمّا يكون القص نظيفاً — هذا صح لا خطأ

/* ٥ — «بدون صورة العطر» يشيل القارورة ويترك الكلام */
await page.selectOption('#heroMode', 'none');
await waitStable(page);
await snap(page, 'none');
const gone = await diff(page, 'auto', 'none', 0, 520);
const still = await diff(page, 'auto', 'none', 560, 1080);
ok('القارورة تختفي من جهتها', gone > 20000, gone + ' بكسل');
ok('الكلام ما يتحرّك', still < 600, still + ' بكسل');
const inkRight = await page.evaluate(() => {
  const d = document.querySelector('#cv').getContext('2d').getImageData(560, 260, 500, 1400).data;
  let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 170 && d[i+1] > 165 && d[i+2] > 140) n++;
  return n;
});
ok('التفاصيل لسه مرسومة', inkRight > 4000, 'حبر ' + inkRight);

/* ٦ — كل مؤشر ميت يقول لماذا */
const offs = [];
for (const id of ['heroX','heroLift','heroScale','heroTilt','heroPose','zoom','pan','panX','heroW','photoIn'])
  offs.push([id, await page.$eval('#' + id, e => e.disabled), !!(await whyOff(page, id))]);
ok('عشرة مؤشرات تنطفئ ومعها سبب مكتوب', offs.every(r => r[1] && r[2]),
   offs.filter(r => !(r[1] && r[2])).map(r => r[0]).join(',') || 'كلها');
ok('السبب صحيح', (await whyOff(page, 'zoom')).includes('بدون صورة العطر'));

/* ٧ — الملاحظة ما تركب على التوقيع (بدون قارورة، عشان ألوانها ما تخربط المسح) */
// التوقيع مرسوم على سطر ثابت: خط أساسه H−SAFE_BOTTOM−26 = ١٦٨٤. الملاحظة
// حمراء، فأي أحمر داخل شريط التوقيع يعني إنهما فوق بعض. ولا نعتمد على الأبيض
// لتحديد التوقيع — نص البطاقة فاتح كذلك.
const clash = await page.evaluate(() => {
  const d = document.querySelector('#cv').getContext('2d').getImageData(0, 1652, 1080, 56).data;
  let red = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i] > 150 && d[i+1] < 120 && d[i+2] < 120) red++;
  return red;
});
const noteDrawn = await page.evaluate(() => {
  const d = document.querySelector('#cv').getContext('2d').getImageData(0, 0, 1080, 1920).data;
  let red = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i] > 150 && d[i+1] < 120 && d[i+2] < 120) red++;
  return red;
});
ok('الملاحظة مرسومة أصلاً', noteDrawn > 300, noteDrawn + ' بكسل أحمر');
ok('الملاحظة ما تركب على التوقيع', clash === 0, clash + ' بكسل أحمر في شريط التوقيع');

/* ٨ — ترجع القارورة لمّا يرجع الخيار */
await page.selectOption('#heroMode', 'auto');
await waitStable(page);
await snap(page, 'back');
const backDiff = await diff(page, 'auto', 'back');
ok('ترجع القارورة كما كانت', backDiff < 600, backDiff + ' بكسل');
ok('حقل الرفع يرجع شغّال', (await page.$eval('#photoIn', e => e.disabled)) === false);

/* ٩ — الملف المحفوظ: المقاس صحيح وما فيه دعوة المعاينة */
await page.selectOption('#layout', 'classic');
await page.waitForTimeout(900);
await snap(page, 'preview');
const dl = page.waitForEvent('download', { timeout: 30000 });
await page.$eval('#saveBtn', e => e.click());
const file = await (await dl).path();
const saved = await page.evaluate(async b64 => {
  const im = new Image();
  await new Promise((res, rej) => { im.onload = res; im.onerror = rej; im.src = 'data:image/png;base64,' + b64; });
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const B = g.getImageData(0, 0, im.width, im.height).data, A = window.__snaps.preview;
  let n = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let y = 0; y < 1920; y++) for (let x = 0; x < 1080; x++){
    const i = (y * 1080 + x) * 4;
    if (Math.abs(A[i]-B[i]) + Math.abs(A[i+1]-B[i+1]) + Math.abs(A[i+2]-B[i+2]) > 10){
      n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { n, x0, x1, y0, y1, w: im.width, h: im.height };
}, fs.readFileSync(file).toString('base64'));
ok('المحفوظة ١٠٨٠×١٩٢٠', saved.w === 1080 && saved.h === 1920, saved.w + '×' + saved.h);
ok('«ارفع صورة العطر» ما تنطبع في الملف',
   saved.n > 400 && saved.y0 > 900 && saved.y1 < 1010 && saved.x0 > 280 && saved.x1 < 800,
   saved.n + ' بكسل داخل [' + saved.x0 + '..' + saved.x1 + '] × [' + saved.y0 + '..' + saved.y1 + ']');

/* ١٠ — «الأساسيات» ما تخفي شيئاً أساسياً */
const seen = {};
for (const id of ['photoIn','heroMode','layout','scene','note','feeling','blockX'])
  seen[id] = await page.$eval('#' + id, e => { const f = e.closest('.field') || e.closest('.slider-row');
                                               return !!(f && f.offsetParent !== null); });
ok('الخيارات الأساسية كلها ظاهرة في «الأساسيات»',
   Object.values(seen).every(Boolean), JSON.stringify(seen));

/* ١١ — قائمة «التصميم» وحدة: ستة دواليب مرسومة ثم غرفه، والاختيار منها يبدّل الخلفية */
const design = await page.$$eval('#scene option', os => os.map(o => o.value));
ok('ستة تصاميم مرسومة وغرفه بعدها في نفس القائمة',
   design.slice(0, 6).every(v => /^s0[1-6]$/.test(v)) && design.length > 6 && design.slice(6).every(v => /^my/.test(v)),
   design.length + ' خيار: ' + design.slice(0, 7).join(' ') + ' …');
await page.selectOption('#scene', 'my1');
await waitStable(page);
await snap(page, 'room');
const roomOn = await page.$eval('#bgRoom', e => e.textContent);
ok('اختيار غرفة من القائمة يخلّيها الخلفية',
   /المستعملة الحين/.test(roomOn) && (await page.$eval('#shelfBlur', e => e.disabled)) === true, roomOn.slice(0, 40));
await page.selectOption('#scene', 's03');
await waitForCabinet(page);
await waitStable(page);
await snap(page, 'drawn');
const roomOff = await page.$eval('#bgRoom', e => e.textContent);
const swapped = await diff(page, 'room', 'drawn', 0, 540);
ok('الرجوع لدولاب مرسوم يشيل الغرفة',
   !/المستعملة الحين/.test(roomOff) && (await page.$eval('#shelfBlur', e => e.disabled)) === false
   && (await page.$eval('#scene', e => e.value)) === 's03' && swapped > 20000,
   swapped + ' بكسل تغيّرت');

/* ١٢ب — عدد المقيّمين يطلع بين قوسين جنب تقييم المجتمع، ويختفي لمّا يُمسح */
await page.selectOption('#layout', 'classic');
await waitStable(page);
await snap(page, 'votes-off');
await page.fill('#votes', '1234');
await waitStable(page);
await snap(page, 'votes-on');
const votesInk = await diff(page, 'votes-off', 'votes-on', 0, 1080);
await page.fill('#votes', '');
await waitStable(page);
await snap(page, 'votes-cleared');
const votesGone = await diff(page, 'votes-off', 'votes-cleared', 0, 1080);
ok('عدد المقيّمين يلحق عبارة المصدر ويختفي لمّا يُمسح',
   votesInk > 300 && votesGone === 0, votesInk + ' بكسل ظهرت، ' + votesGone + ' بقيت بعد المسح');

/* ١٢ — التقييم مؤشر واحد: يحرّك الرقم المرسوم، وما بقي من المعايير شي */
const leftovers = await page.evaluate(() => ['critList','weightList','seedBtn','resetWeights','scoreBig']
  .filter(id => document.getElementById(id)));
await snap(page, 'score-before');
await setRange(page, 'score', 6.4);
await waitStable(page);
await snap(page, 'score-after');
const scoreTxt = await page.$eval('#scoreNote', e => e.textContent);
const scoreMoved = await diff(page, 'score-before', 'score-after', 540, 1080);
ok('مؤشر التقييم الواحد يغيّر الرقم على الصورة',
   leftovers.length === 0 && scoreTxt === '6.40' && scoreMoved > 500,
   scoreTxt + ' · ' + scoreMoved + ' بكسل · بقايا: ' + (leftovers.join(',') || 'لا'));

/* ١٣ — خطة النشر محذوفة، والحفظ في الأرشيف ما زال يشتغل بدونها */
const planLeft = await page.evaluate(() => ['planList','planFill','planClear','planNote'].filter(id => document.getElementById(id)));
const archBefore = await page.$eval('#archNote', e => e.textContent);
await page.click('#archSave');
await page.waitForTimeout(400);
const archAfter = await page.$eval('#archNote', e => e.textContent);
ok('خطة النشر راحت والحفظ في الأرشيف شغّال',
   planLeft.length === 0 && archBefore !== archAfter,
   archBefore + ' ← ' + archAfter + ' · بقايا: ' + (planLeft.join(',') || 'لا'));

ok('ما فيه أخطاء جافاسكربت', errors.length === 0, errors.slice(0, 3).join(' | '));

await shot(page, 'test/last-frame.png');
const allGood = done();
await close();
process.exit(allGood ? 0 : 1);
