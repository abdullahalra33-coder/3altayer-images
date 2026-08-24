# -*- coding: utf-8 -*-
"""Turn the Salla product export into a compact perfume dataset.
Mirrors the JS parser used against the live API, so both read the same markup."""
import openpyxl, json, re, io
from lxml import html as LH

AR = re.compile(r'[؀-ۿ][؀-ۿ\sـ’\']*')

def latin_tail(s):
    m = re.search(r"[A-Za-z][A-Za-z0-9\s&'’.\-+/]*$", s or "")
    return re.sub(r'\s+', ' ', m.group(0)).strip() if m else ""

def pick_note(chunk):
    t = chunk.strip()
    m = AR.search(t)
    if m and len(m.group(0).strip()) > 1:
        return re.sub(r'\s+', ' ', m.group(0)).strip()
    return re.sub(r'\s+', ' ', t).strip()

LABELS = [("t", re.compile(r'TOP\s*NOTES', re.I)),
          ("m", re.compile(r'HEART\s*NOTES', re.I)),
          ("z", re.compile(r'BASE\s*NOTES', re.I))]

# Some source rows carry Fragrantica review chatter where notes should be
# ("Smelling of Bay Jun 19", "you will be able to add your own reviews").
JUNK = re.compile(r'(?i)\b(review|reviews|inspired|smelling|you|your|click|http|www)\b')
def is_note(t):
    if not t or len(t) > 28: return False
    if len(t.split()) > 4: return False
    if re.search(r'\d', t): return False
    if JUNK.search(t): return False
    return True

def parse(desc, name, brand_raw):
    out = {}
    if not desc: return out
    try: doc = LH.fromstring(desc)
    except Exception: return out

    # confine the search to the pyramid block so unrelated copy cannot match
    anchor = next((p for p in doc.xpath('//p')
                   if 'الهرم العطري' in (p.text_content() or "")), None)
    scope = anchor.getparent() if anchor is not None else doc
    for key, rx in LABELS:
        head = next((p for p in scope.xpath('.//p')
                     if rx.search(p.text_content() or "") and len(p.text_content()) < 60), None)
        if head is None: continue
        body = head.getnext()
        if body is None: continue
        notes = [pick_note(c) for c in (body.text_content() or "").split("·")]
        notes = [x for x in notes if is_note(x)][:4]
        if notes: out[key] = " · ".join(notes)

    leaves = [e for e in doc.iter() if len(e) == 0 and (e.text_content() or "").strip()]
    def stat(label):
        for e in leaves:
            if (e.text_content() or "").strip() == label:
                box = e.getparent()
                if box is None: continue
                mm = re.search(r'(\d+(?:\.\d+)?)\s*من\s*5', box.text_content() or "")
                if mm: return float(mm.group(1))
        return 0
    for key, lab in (("l","الثبات"), ("p","الفوحان"), ("c","تقييم المجتمع")):
        v = stat(lab)
        if v: out[key] = v

    for e in leaves:
        if re.match(r'^الأنسب\s*لـ', (e.text_content() or "").strip()):
            box = e.getparent()
            if box is None: break
            kids = [(k.text_content() or "").strip() for k in box]
            kids = [k for k in kids if k]
            if len(kids) > 1 and kids[1]: out["e"] = kids[1]
            meta = next((k for k in kids if "·" in k), None)
            if meta:
                parts = [x.strip() for x in meta.split("·") if x.strip()]
                if parts:
                    out["g"] = parts[-1]
                    # parts[0] is the same sentence on every product; parts[1] varies
                    out["w"] = parts[1] if len(parts) >= 3 else parts[0]
            break

    facts = {}
    for li in doc.xpath('//li'):
        st = li.find('strong')
        if st is None or not st.text: continue
        k = st.text.strip().rstrip(':：').strip()
        v = (li.text_content() or "")[len(st.text):].lstrip(':： ').strip()
        if k and v: facts[k] = v
    if facts.get("العائلة العطرية"): out["f"] = facts["العائلة العطرية"]
    if facts.get("سنة الإصدار"):     out["y"] = facts["سنة الإصدار"]
    u = facts.get("المعطّر") or facts.get("المعطر")
    if u: out["u"] = u
    if not out.get("g") and facts.get("الفئة"): out["g"] = facts["الفئة"]
    return out

AR_STOP = ('عطر','تستر','عينة','تقسيم','مجموعة','او','أو','دو','دي','تواليت','بارفيوم',
           'برفيوم','بارفان','كولونيا','كولون','مل','بخاخ','سبراي','ماء','معطر','ديودرنت',
           'مزيل','للرجال','للنساء','للجنسين','رجالي','نسائي','اكستريت','اكسترا','إكسترا')

def arabic_keywords(full, brand_ar):
    """Searchable Arabic text: the product's Arabic words minus boilerplate."""
    ar = re.sub(r"[A-Za-z0-9&'’.\-+/]+", " ", full or "")
    brand_words = set(re.findall(r'[؀-ۿ]+', brand_ar or ""))
    out = []
    for w in re.findall(r'[؀-ۿ]+', ar):
        if w in AR_STOP or w in brand_words: continue
        if len(w) < 2: continue
        if w not in out: out.append(w)
    return " ".join(out[:7])

def clean_name(full, brand_latin):
    t = latin_tail(full)
    t = re.sub(r'\beau\s+de\s+(parfum|toilette|cologne)\b', ' ', t, flags=re.I)
    t = re.sub(r'\bextrait\s+de\s+parfum\b', ' ', t, flags=re.I)
    t = re.sub(r'\b(edp|edt|edc)\b', ' ', t, flags=re.I)
    t = re.sub(r'\b\d+\s*ml\b', ' ', t, flags=re.I)
    for w in (brand_latin or "").split():
        if len(w) > 2:
            t = re.sub(r'\b' + re.escape(w) + r'\b', ' ', t, flags=re.I)
    t = re.sub(r'(?i)\bfor\s+(men|women|man|woman|him|her)\b', ' ', t)
    t = re.sub(r'(?i)\b(perfumes?|cologne|deodorant|spray|tester)\b', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'(?i)^(de|du|la|le|les|d)\s+', '', t)
    t = re.sub(r'(?i)\s+(de|du|d)$', '', t)
    words, dedup = t.split(), []
    for w in words:
        if not dedup or dedup[-1].lower() != w.lower(): dedup.append(w)
    t = " ".join(dedup).strip()
    if t and t == t.lower(): t = t.title()
    return t

wb = openpyxl.load_workbook('products.xlsx', read_only=True, data_only=True)
ws = wb['Salla Products Template Sheet']

best = {}
total = skipped = 0
for row in ws.iter_rows(min_row=3, values_only=True):
    if not row or not row[2]: continue
    total += 1
    name  = str(row[2]); desc = str(row[8] or ""); brand_raw = str(row[21] or "")
    price = row[7]
    brand = re.sub(r'^Christian\s+', '', latin_tail(brand_raw), flags=re.I)
    pname = clean_name(name, brand)
    if not brand or not pname: skipped += 1; continue
    rec = parse(desc, name, brand_raw)
    if not rec: skipped += 1; continue
    rec["b"] = brand; rec["n"] = pname
    ar = arabic_keywords(name, brand_raw)
    if ar: rec["a"] = ar
    rec["_ba"] = " ".join(re.findall(r'[؀-ۿ]+', brand_raw))
    if price: rec["r"] = round(float(price))
    key = (brand.lower(), re.sub(r'\s+', ' ', pname.lower()))
    score = len(rec) + 3 * sum(1 for k in ("t","m","z") if rec.get(k))
    prev = best.get(key)
    if prev is None or score > prev[0]: best[key] = (score, rec)

rows = sorted((v[1] for v in best.values()), key=lambda r: (r["b"], r["n"]))
rows = [r for r in rows if r.get("n")]

# brand -> Arabic label, from the store's own brand column
BRAND_AR = {}
for r in rows:
    ba = r.pop("_ba", "")
    if ba and r["b"] not in BRAND_AR: BRAND_AR[r["b"]] = ba

# these four repeat across thousands of rows — store them once
DICTS = {}
for f in ("g", "w", "e", "f"):
    vals = sorted({r[f] for r in rows if r.get(f)})
    idx = {v: i for i, v in enumerate(vals)}
    DICTS[f] = vals
    for r in rows:
        if r.get(f) is not None: r[f] = idx[r[f]]

payload = {"d": DICTS, "ba": BRAND_AR, "p": rows}
io.open('perfumes.json','w',encoding='utf-8').write(json.dumps(payload, ensure_ascii=False, separators=(',',':')))
import os
print(f"rows read: {total} | unique perfumes: {len(rows)} | skipped: {skipped}")
print("json size:", os.path.getsize('perfumes.json'), "bytes")
have = lambda k: sum(1 for r in rows if r.get(k) is not None)
for k, lab in (("t","pyramid top"),("l","longevity"),("p","sillage"),("c","community"),
               ("e","season"),("g","gender"),("u","perfumer"),("f","family"),("y","year"),("r","price")):
    print(f"  {lab:14} {have(k):5}  ({have(k)*100//len(rows)}%)")
from collections import Counter
tc = Counter(sum(1 for k in ("t","m","z") if r.get(k)) for r in rows)
print("\ntiers per perfume:", dict(sorted(tc.items())))
print("with at least one tier:", sum(v for k,v in tc.items() if k), f"({sum(v for k,v in tc.items() if k)*100//len(rows)}%)")
print("\nsample:")
for r in rows[:4]: print("  ", json.dumps(r, ensure_ascii=False)[:190])
